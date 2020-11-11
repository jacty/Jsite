const arrays = {
  depeat(arr) {    
    //Remove repeated elements from an Array
      
      return Array.from(new Set(arr));

  },
  *elements(arr){
    /*Fetch all the elements in an Array, especially for Arrays with mutiply layers like [1,2,[3,4]]. It returns a Generator */
    if (Array.isArray(arr)) {
      for (let i = 0; i < arr.length; i++) {
        yield *this.elements(arr[i]);
      }
    } else {
      yield arr;
    }
  },
  len(str){
    /*Count the length of a string. This method is more accurate than string.length, because it can handle on Unicode bug.  */
    return Array.from(str).length;
  },
  remove(arr, ele){
    //Remove the first item from the list whose value is equal to x. 
    const ind = arr.indexOf(ele);
    arr.splice(ind,1);  
  },
  count(arr,ele){
    //Return the number of times ele appears in Array arr.
    return arr.filter((x)=>{
      return (x === ele);
    }).length;
  } 
};

export default arrays;