
import { createServer } from "http";
import got from "got";
import URL from 'url'

const listeningPort = 8080
const downloadTimeout = 2500
createServer((req, res) => {
    req.on('error', (err) => {
        // Error in request
        console.error(err)
        res.statusCode = 400
        res.end()
    })
    if (req.method === 'GET') /*&& req.url.startsWith('/img?'))*/ {
        let imgURL = URL.parse(req.url).search.substring(1)
        // let domain = getImageURL(req.url)
        //     // You only have single parameter after '?'
        // let index = url.indexOf('?')
        // if (index !== -1) {
        // }
        // let url = req.url.substring(url.indexOf('?') + 1)
        // if (domain) {
        if (imgURL) {
            console.log('imgURL : ' + imgURL)
            // domain is a non-empty string
            // let faviconURL = domain + "/favicon.ico"
            // if (!faviconURL.startsWith("https")) {
            //     faviconURL = "https://" + faviconURL
            // }
            try {
                // Download this favicon
                res.setHeader("content-disposition", "attachment; filename=img"/*.ico"/* + imgURL.substr(-3)*/);

                // let downloadStream = got.stream(faviconURL, { "timeout": downloadTimeout });
                let downloadStream = got.stream(imgURL, { "timeout": downloadTimeout, "rejectUnauthorized" :false });
                downloadStream.on("error", (error) => {
                    console.log(error)
                    res.statusCode = 404;
                    res.end();
                    return
                })
                res.on("error", (error) => {
                    console.log('Response error while downloading: ' + error)
                })
                downloadStream.pipe(res);
                // console.log('createServer, post request')
            } catch (error) {
                // Let it be internal error
                console.error(error)
                console.error('sending response error 500')
                res.statusCode = 500;
                res.end(error.toString());
            }
        } else {
            // URL Image Not provided!!
            res.statusCode = 400;
            res.end();
        }
    } else {
        // return NOT Found response
        res.statusCode = 404;
        res.end();
    }
}).listen(listeningPort);

console.log("Server is listening on port " + listeningPort + ".")      //Terminal output