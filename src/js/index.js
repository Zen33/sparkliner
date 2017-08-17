
var refBars1 = document.getElementById("root-bars");
new sparkLiner(refBars1, [4,-4,6,3,4,-5,7,3], "bars");

var refBars2 = document.getElementById("root-dots");
new sparkLiner(refBars2, [4,-4,6,3,4,-5,7,3], "dots");

var refBars3 = document.getElementById("root-polygon");
new sparkLiner(refBars3, [4,-4,6,3,4,-5,7,3], "polygon");

var refBars4 = document.getElementById("root-hist");
new sparkLiner(refBars4, [1,1,3,3,3,4,5,7,7,9,9,9], "histogram");

var refBars5 = document.getElementById("root-progressgradient");
new sparkLiner(refBars5, [5,6], "progressgradient");

var refBars6 = document.getElementById("root-progressstep");
new sparkLiner(refBars6, [2.5,12], "progressstep");

var refBars7 = document.getElementById("root-circle");
new sparkLiner(refBars7, [37,88], "progresscircle");
