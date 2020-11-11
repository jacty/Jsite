export function swap(num1, num2){
    num1 ^= num2, num2 ^= num1, num1 ^= num2;
    return [num1, num2];
}

export function rnd(min=0, max=10){
  // Create random number between min and max.
  return parseInt(Math.random() * (max - min + 1) + min, 10);
}


