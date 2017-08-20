# sparkliner.js

[See examples page](https://alexilins.github.io/sparkliner/)

A tiny VanillaJS library to draw small plots, also known as "sparklines". All drawings executes via SVG figures.

Note: Technically, you can use sparkliner to build interactive common full-size plots because the  result takes the size of its container.

## Why sparkliner.js?

* built on top of pure Vanilla Javascript, with absolutely no dependecies
* light-weight (~13 kB just uglified, even without gzipping)

## How to connect sparkliner.js to my project?

There are two files you need to include in your project in order to use library: the js file and css file for UI customization. All of them are placed in "/lib_sparkliner/" directory.

To include JS you can pick either ES6 class (if you using bundlers) or ES5 minified version (preferable if you want just to paste it in HTML).

Including CSS is similar to JS: you can pick either pure CSS human-readable version or minified.

## Ok, i've connected it, how to use?

General usage:

```javascript
var reference = document.getElementById("root");
new sparLiner(reference, [data1, data2 ... dataN], "type", {options});
```

Let's see what arguments we passing to constructor:

* _reference_ - is a link to plot container, can be also a nodeList, in this case you need to iterate over its members and call sparkline constructor on every of them;
* _[data1, data2 ... dataN]_ - array of data points (array of _numbers_);
* _"type"_ - string with name of plot type;
* _{options}_ - it's not critical argument, object of additional options in key:value format.

## What types of plots are supported?

[See examples page](https://alexilins.github.io/sparkliner/)

There are current supported values for "type" argument:

* __"bars"__ - bar plot;
* __"dots"__ - dot plot;
* __"polygon"__ - line plot with area filling, can be transformed into just line or just area-filling type of plot via CSS-rules;
* __"histogram"__ - represents frequency of values in input data array;
* __"progressgradient"__ - binary plot, you can pass to data array argument either two values or just one. If there is only one value - it supposed to be percents and must be in range 0<=value<=100. Otherwise, if there are two values in array - the second will be recalculated as 100%, so the first will be recalculated as percentage-part of second.
* __"progressstep"__ - binary plot (see "progressgradient" type) with clear area filling, border between areas looks like step;
* __"progresscircle"__ - binary plot (see "progressgradient" type) with piechart-style representation.

## It works! But how can i customize it?

As already mentioned, you can customize most of font/colors/etc type of options via CSS file, all class names are self-describing and separated into blocks of different types of plots.

Also, you can specify some options via passing __options__ object to constructor function as key:value pairs.

There is only one option which affects plot no matter what type is it:
```javascript
{
    showTooltips: true/false
}
```
As you can see, it describes, do you need the interactive tooltip to be active for this plot or not.

All other options depends on type of plot, here is the complete list:

1. "bars" type options

    * __barSpace: Number__
    
      Number >= 0, specifies free space between separate bars

2. "dots" type options

    * __dotRadius: Number__

      Number >= 0, specifies the radius of data points

    * __dotVerticalLine: Boolean__

      true/false, makes it possible to turn off vertical lines in data points

3. "polygon" type options

    * __lineShowCursor: Boolean__

      true/false, turning on/off the vertical line while hovering plot

4. "histogram" type options

    * __histogramBarCount: Number__

      Number >= 1, specifies amount of bars (areas in entire range of input values)

    * __histogramBarSpace: Number__

      Number >= 0, similar to barSpace for "bars" type plot

5. "progressgradient" type options

    * __progressGradientStart: "Color"__

      "red"/"#fff"/"rgb()"/"rgba()", color of plot start (left side)

    * __progressGradientEnd: "Color"__

      "red"/"#fff"/"rgb()"/"rgba()", color of plot end (right side)

    * __progressGradientLineOverflow: Number__

      Number >= 0, specifies how much the border line between areas overflows the container in vertical dimension

6. "progressstep" type options

    * __progressStepLineOverflow: Number__

      Number >= 0, similar to _progressGradientLineOverflow_

Please, if you can't find some option in list - try to search right class in CSS and configure it.