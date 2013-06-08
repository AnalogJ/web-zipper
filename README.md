## Synopsis

The Web-Zipper application will take a list of urls, file paths and a callback url, and generate a zip file containing all specified files. The generated zip file will then be uploaded to the Mega service. Once the upload is complete, the app will post to the callback url with the final upload link on Mega. 

## Example

A demo of the application is available by visiting:
[http://analogj.github.io/web-zipper](http://analogj.github.io/web-zipper)

## Motivation
While building [QuietThyme](http://www.quietthyme.com), my cloud ebook manager, I wanted to ensure that my users would be able to export their library at any time. As our free plan supports up to 100 ebooks, and our popular Catalog plan goes up to 500 ebooks, we needed to create a fire-and-forget process that would work asyncrounously to process the ebooks and inform us once the backup was complete. 

We use a more complex version of the Web-Zipper that stores the backup zip file on Amazon S3, and preforms some custom validation, however the working example above will give you a good starting point.

## Installation

Just pull down the code and start a new node instance with nodejs, or push to heroku. 

## API Reference

Currently the only method in the api is the <code>generate</code> function


## License

The Web-Zipper code is available under the MIT license. 
