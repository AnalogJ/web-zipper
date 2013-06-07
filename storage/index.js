var mega = require('mega')
var fs = require('fs');

/***
 * Function will copy the local file to external cloud storage, and then generate a link which is sent to the callback
 * function as a parameter.
 * @param localfilepath
 * @param callback
 */
exports.moveToCloudStorage = function(localfilepath, callback){
    console.log('begin moving file to cloud storage');
    var storage = mega({email: '', password: ''}, function(err) {

        if(err){
            callback(null, err);
            return;
        }

        // storage.files
        var today = new Date();
        var todayStr = ''+today.getUTCFullYear() +'-'+ (today.getUTCMonth()+1)+'-'+ today.getUTCDate();


        fs.createReadStream(localfilepath).pipe(storage.upload('QuietThyme-'+todayStr+'.zip',function(err, file){
            if(err){
                callback(null, err);
                return;
            }

            file.link(function(err, url) {
                if(err){
                    callback(null, err);
                    return;
                }

                //finished uploading the file to mega, can now delete temp local file.
                fs.unlink(localfilepath, function (err) {
                    if (err){
                        console.log('error occured while deleting '+localfilepath);
                    }
                    else{
                        console.log('successfully deleted '+ localfilepath);
                    }

                });

                // url: https://mega.co.nz/#!downloadId!key
                console.log('cloud storage url: ',url);
                callback(url, null)
            })
        }))
    })




}

