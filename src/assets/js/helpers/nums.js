const numbers = {
  swap(num1, num2){
    // Swap values of num1 and num2.
    num1 ^= num2, num2 ^= num1, num1 ^= b;
  }
  toInt32(num){
    return ~~num;
  }
  rnd(min, max){
    /*For creating random numbers */
    const argsLen = arguments.length;  
    const len ={
      1:function () {
        return parseInt(Math.random() * min +1, 10);
      },
      2:function () {
        return parseInt(Math.random() * (max - min + 1) + min, 10);
      }
    }
    
    if(argsLen!==0){
      return len[argsLen]()
    } else {
      return 0;
    }
  },
  verCompare(v1,v2){
    /*Compare two version number,if v1 > v2, return true; v1<v2, return false, otherwise return 0 */

    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
      v1.push('0');
    }

    while (v2.length < len) {
      v2.push('0');
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i]);
      const num2 = parseInt(v2[i]);

      if (num1 > num2) {
        return true;
      } else if (num1 < num2) {
        return false;
      }
    }
    return 0;
  }
};

export default numbers;