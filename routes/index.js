var uuid = require('node-uuid');
var archiver = require('archiver');
var fs = require('fs');
var http = require('http');
var stream = require('stream');
var util = require('util');
var async = require('async');
var request = require('request');
var storage = require('../storage');

var ERROR_CODES = {
    INVALID_POST_DATA : 1,
    CLOUD_STORAGE : 2
}




exports.generateZip = function ( req, res ){

    var postdata = this.req.body;
    if(!validate(postdata)){
        var errorJson = new FailureResp(null, ERROR_CODES.INVALID_POST_DATA, "Invalid Post Data");

        this.res.writeHead(200, { 'Content-Type': 'application/json','Access-Control-Allow-Origin' : 'analogj.github.io' })
        this.res.end(JSON.stringify(errorJson));
        console.log('invalid post data:', postdata);
        return;
    }

    //generate new zip file.
    console.log('generate new zip file with post data:', postdata);
    var files = postdata.files;

    //generate zipfile name.
    var zipfile_path = '/tmp/'+uuid.v1()+'.zip';
    console.log('storing at path:', zipfile_path);

    generateExecutionPlan(files, zipfile_path,null, function(zippath, skippedfiles){
        console.log('finished generating zipfile');
        console.log(zippath, skippedfiles);

        storage.moveToCloudStorage(zippath, function(cloud_url, err){
            console.log('finished moving file to cloud storage');
            var responseJson;
            if(err){
                responseJson = new FailureResp(null,ERROR_CODES.CLOUD_STORAGE, "An error occured saving file to cloud storage.");
            }
            else{
                responseJson = new SuccessResp({
                    url: cloud_url,
                    skipped: skippedfiles
                });
            }
            console.log('postind data to webhook:', responseJson);
            //send data back to server.
            request({
                url: postdata.webhook_url,
                method: "POST",
                json: responseJson
            });
        })

    })


    //ReadStream


    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    this.res.end(JSON.stringify(this.req.body));
};
/***
 * Generates an execution plan for the list of files.
 * Iterates through each and creates a task for each, then calls the parallel method of async to execute them.
 * @param files
 * @param zipfile_path
 * @param limit //optional
 * @param callback //optional
 */
function generateExecutionPlan(files, zipfile_path, limit, callback){
    console.log('begin generating zipfile');
    var tasks = [];

    var output = fs.createWriteStream(zipfile_path)
    var zip = archiver('zip');
    zip.on('error', function(err) {
        throw err;
    });
    zip.pipe(output);


    //generate list of tasks from files list.
    for(var ndx in files){
        var file = files[ndx];
        tasks.push(singleTask(file.url, file.path,zip));
    }

    if(limit){
        async.parallelLimit(tasks, completionTask(zip,zipfile_path,callback));
    }
    else{
        async.parallel(tasks, completionTask(zip,zipfile_path,callback));
    }

}
/***
 * Generates a single task compatible with the async library.
 * When given a file url and file path, it will attempt to download the url filestream and then save it into the zip with
 * the specified file path.
 * @param file_url
 * @param file_path
 * @param zip
 * @returns {Function}
 */
function singleTask(file_url,file_path, zip){

    return function(cb){
        var _file_url = file_url;
        var _file_path = file_path;
        var _zip = zip;

        var req = request({url:_file_url, encoding:null});

        _zip.append(req, { name: _file_path }, function(err){
            if(err){
                cb(null, _file_path);
                return;
            }
            cb(null, false);
        });
    }
}
/***
 * Function generates a completetion task for the async library. Given a zip file and a filename, it will save the file
 * and execute a callback with the format:
 * callback(zipfile_name, errors)
 * @param zip
 * @param filename
 * @param cb
 * @returns {Function}
 */
function completionTask(zip, filename, cb){

    return function(err, results){
        var _zip = zip;
        var _filename = filename;
        var _cb = cb;
        _zip.finalize(function(err, written) {
            if (err) {
                throw err;
            }

            console.log(written + ' total bytes written');
        });

        var errors = [];
        for(var ndx in results){
            var err = results[ndx];
            if(err){
                errors.push(err);
            }
        }

        if(_cb){
            //if callback is defined, execute code with the filename of the saved zip, and the errors (the files that oculd not be downloaded);
            _cb(_filename, errors);
        }
    }
}

/***
 * validates the post body and ensures its in the correct format.
 * @param content
 * @returns {Number|*}
 */
function validate(content){
    return (content.files.length) && (content.webhook_url);
}

function SuccessResp(data){
    return {
        statusCode: 0,
        data : data,
        error: null
    }
}
function FailureResp(data,errorCode, errorMessage){
    return {
        statusCode: -1,
        data : data,
        error: {
            code: errorCode,
            message: errorMessage
        }
    }
}