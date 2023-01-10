var a=Date.now();

const d= new Date((a-604800000));

const b= new Date();

console.log(d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear());

console.log(b.getDate()+"/"+(b.getMonth()+1)+"/"+b.getFullYear());
