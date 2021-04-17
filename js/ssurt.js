/**
 *
 *
 * Copyright (C) 2020-2021  Bibliotheca Alexandrina
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 *
 */

/**
 * This module provides some simple API for converting url in ssurt format to regular one and vice versa.
 * For more, hace a look at:
 * 
 *                          https://github.com/iipc/urlcanon
 * 
 */


import { utilities } from "@/js/utilities.js";


export const ssurt = {
    // Convert a url in a SSURT format to normal format
    ssurtToRegularURL: function (ssurt) {
        // Teh following info are from the link below:
        // https://github.com/iipc/urlcanon/blob/master/ssurt.rst

        //Indicative grammar (grammars alone are not powerful enough to describe URL parsing):
        //SSURT = [ [ ssurt_host  "//" ] ] [ [ port ] ":" ] [ [ scheme ] [ "@" [ userinfo ] ] ":" ] path [ "?" [ query ] ] [ "#" [ fragment ] ]
        //ssurt_host = revdomain "," / IPv4address / "[" IPv6address "]"

        let url = ""    // hold final url composed
        const schemeList = ['https', 'http']       // possible schemes available (will be incremented by time)
        // Notice that you should let 'https' come before 'http'

        // Start to parse to get host
        let hostname = ''
        let pathWithScheme = ''
        let index = ssurt.indexOf('//')
        if (index !== -1) {
            // ssurt string has scheme which will be extracted later
            hostname = ssurt.substring(0, index - 1).split(',').reverse().join('.')

            // Get path with scheme
            pathWithScheme = ssurt.substring(index + 2)
        } else {
            // Here ssurt is without any scheme (e.g. com,google,www)
            hostname = ssurt.split(',').reverse().join('.')
            url = hostname

            // So, return url directly
            return url
        }

        // Search for the scheme
        for (index = 0; index < schemeList.length; index++) {
            // Get and hold schema position
            let schemePos = pathWithScheme.toLocaleLowerCase().indexOf(schemeList[index])
            if (schemePos !== -1) {
                // Scheme found

                let schema = ""         // Hold the scheme
                let port = ""           // Hold the port
                let userInfo = ""       // Hold the userInfo
                let path = ""           // Hold the path
                let pos = 0             // Temp variable for holding position
                // Extract it
                schema = pathWithScheme.substr(schemePos, schemeList[index].length)

                // Search for the port if exists
                if (schemePos > 0) {
                    // Schema comes after a port => get that port
                    port = pathWithScheme.substring(0, schemePos - 1) // The port format should be like "n" where n is number
                }

                // Search for user Info if exists
                // To do this, check for '@' after schema
                if (pathWithScheme.charAt(schemePos + schemeList[index].length) === '@') {
                    pos = utilities.indexOfNth(pathWithScheme, ':', 2)
                    // Get username and password
                    userInfo = pathWithScheme.substring(schemePos + schemeList[index].length + 1,
                        pos)
                    path = pathWithScheme.substring(pos + 1)  // Extract the path
                } else {
                    userInfo = ""
                    path = pathWithScheme.substring(schemePos + schemeList[index].length + 2)   // Extract the path
                }
                url = schema + '://' + (userInfo.length === 0 ? '' : userInfo + '@')
                    + hostname + (port.length === 0 ? '' : ':') + '/' + path
                // No need to continue theb loop
                break
            }
        }
        return url;
    },

    // Convert a given url srting to SSURT format 
    regularURLToSSURT: function (urlStr) {

        // Teh following info are from the link below:
        // https://github.com/iipc/urlcanon/blob/master/ssurt.rst

        //Indicative grammar (grammars alone are not powerful enough to describe URL parsing):
        //SSURT = [ [ ssurt_host  "//" ] ] [ [ port ] ":" ] [ [ scheme ] [ "@" [ userinfo ] ] ":" ] path [ "?" [ query ] ] [ "#" [ fragment ] ]
        //ssurt_host = revdomain "," / IPv4address / "[" IPv6address "]"
        let errorMessage = ''
        let ssurt = ''                 // hold final result
        try {
            let url = new URL(urlStr)      // Create object URL

            // These are the methods that can be called for object of type URL
            // url.pathname                   // Path Name
            // url.port                       // Port Number
            // url.host                       // Host Name (returns port number concatenated with : if supplied)
            // url.hostname                   // Host Name (never returns port number even if supplied)
            // url.password                   // Password
            // url.protocol                   // Protocol
            // url.username                   // Username
            // url.search                     // query string
            // url.hash                       // fragment identifier



            // Start to add the domain and reverse it if is not ipv4 or ipv6
            if (this.isIPv4(url.hostname) || this.isIPv6(url.hostname)) {
                // This is normal domain name
                ssurt = url.hostname
            } else {
                ssurt = url.hostname.split('.').reverse().join(',') + ","     // Reverse hostname and replace '.' with ','
            }

            // Now, Combine ssurt_host

            // Next we combine "//"
            ssurt += "//"

            // then, combine port if exists
            if (url.port.length > 0) {
                ssurt += url.port + ":"
            }

            // then, combine scheme or protocol (according to URL class, this can't be null at all)
            ssurt += url.protocol

            // Then, append username and password if they exist
            if (url.username.length > 0) {
                // According to URL reference https://developer.mozilla.org/en-US/docs/Web/API/URL/protocol, the protocol is returned with ':'. So, to concatenate the username and password
                //    you have to insert username and password after the 'http' directly
                ssurt = ssurt.substring(0, ssurt.length - 1) + "@" + url.username + ":" + url.password + ":"
                // ssurt += "@" + url.username + ":" + url.password
            }

            // Then, append path
            ssurt += url.pathname

            // Then, append query string
            if (url.search.length > 0) {
                ssurt += url.search
            }

            // Finally, add fragment identifier
            if (url.hash.length > 0) {
                ssurt += url.hash
            }
        } catch (error) {
            errorMessage = error
            ssurt = ''
        }
        return { ssurt: ssurt, error: errorMessage }
    },

    // Check if that domain is ipv4 address
    isIPv4: function (hostname) {
        // Format of ipv4 is as follows:
        //          d.d.d.d where  d >=  0 and d <= 255
        const pattern = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)([.](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$")

        return pattern.test(hostname)
    },

    // Check is the hostname is ipv6 address
    isIPv6: function (hostname) {
        // Since the ipv6 have two squared brackets inside, searching for these brackets can  be enough.
        return hostname.indexOf('[') != -1 && hostname.indexOf(']') != -1
    },
}