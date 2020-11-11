/**
*    return the length of `str`. This method is more accurate than 
* string.length which has some Unicode bugs.
*
* @param {String | Number} str
*/
export function len(str){
    /*Count the length of a string. This method is more accurate than string.length, because it can handle on Unicode bug.  */
    return Array.from('' + str).length;
  }