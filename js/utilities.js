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
 * This module provides miscellaneous functions
 */

export const utilities = {
    // Replace a character at given index with new string 
    //  str: target string
    //  index: the position of character to be replaced
    //  newstr: the new string to be inserted "str"
    //  Returns a new string with an inserted another one in a certain position
    setCharAt: function (str, index, newStr) {
        return (index > str.length - 1 || index < 0) ? str : str.substr(0, index) + newStr + str.substr(index + 1);
    }

    // Find the nth position for the occurrence of substring in string
    // str: string will be searched
    // substr: the target token
    // n: the number of occurrence
    // Returns true if successfully found, otherwise return -1
    //                          SAMPLES
    //  indexOfNth("This is very nice. The island is wonderful, isn't it?","is",1)  // Return 2
    //  indexOfNth("This is very nice. The island is wonderful, isn't it?","is",3)  // Return 23
    //  indexOfNth("This is very nice. The island is wonderful, isn't it?","is",4)  // Return 30
    //  indexOfNth("This is very nice. The island is wonderful, isn't it?","is",5)  // Return 44
    //  indexOfNth("This is very nice. The island is wonderful, isn't it?","is",6)  // Return -1
    ,
    indexOfNth: function (str, substr, n) {
        let nextStart = 0;
        for (let index = 0; index < n && nextStart !== -1; index++, nextStart++) {
            nextStart = str.indexOf(substr, nextStart)
        }
        return (nextStart === -1) ? -1 : nextStart - 1;
    }
    ,
    // // Find the number of digit counts for entered integer
    // getDigitCount: function (num) {
    //     let n = Number(num)
    //     if ()
    // }
}