const sparkLiner = class {
    constructor(ref, data, type, options) {
        this._root = ref;
        this._data = data;
        this._dataLen = this._data.length;
        this._type = type;
        
        this._defaults = {
            showTooltips: true,

            barSpace: 2,
            
            dotRadius: 4,
            dotVerticalLine: true,
            
            lineShowCursor: true,

            histogramBarCount: 5,
            histogramBarSpace: 2,

            progressGradientStart: "red",
            progressGradientEnd: "rgb(120, 141, 255)",
            progressGradientLineOverflow: 10,

            progressStepLineOverflow: 10
        }
        this._options = Object.assign({}, this._defaults, options);
        
        this._computedStyle = getComputedStyle(this._root);
        this._rootWidth = this._root.clientWidth - parseInt(this._computedStyle.paddingLeft)
            - parseInt(this._computedStyle.paddingRight);
        this._rootHeight = this._root.clientHeight - parseInt(this._computedStyle.paddingTop)
            - parseInt(this._computedStyle.paddingBottom);
            
        switch(this._type) {
            case "bars":
                this._renderBars();
                break;
            case "dots":
                this._renderDots();
                break;
            case "polygon":
                this._renderPolygon();
                break;
            case "histogram":
                this._renderHistogram();
                break;
            case "progressgradient":
                this._renderProgressGradient();
                break;
            case "progressstep":
                this._renderProgressStep();
                break;
            case "progresscircle":
                this._renderProgressCircle();
                break;
            default:
                alert("Invalid type of chart");
        }
        
        this._activateTooltip();
    }

    _activateTooltip() {
        if (this._options.showTooltips && !document.getElementById("sparkliner__tooltip")) {
            this._tooltip = document.createElement('div');
            this._tooltip.id = "sparkliner__tooltip";
            document.body.appendChild(this._tooltip);
            document.body.addEventListener("mousemove", (e) => {
                this._tooltip.style.left = `${e.clientX+15}px`;
                this._tooltip.style.top = `${e.clientY+15+window.pageYOffset}px`;
            });
        } else {
            this._tooltip = document.getElementById("sparkliner__tooltip");
        }
    }
    
    _calculateIntersection(point1, point2, step) {
        const coefficient = (point2[1] - point1[1]) / step;
        return point1[0] + Math.abs(point1[1] / coefficient);
    }

    _positionToValue(position, dataPoints, scaleCoefficient) {
        for (let i = 0; i < dataPoints.length - 1; i++) {
            if (position >= dataPoints[i][0] && position <= dataPoints[i+1][0]) {
                let deltaX = position - dataPoints[i][0];
                let coefficient = (dataPoints[i+1][1] - dataPoints[i][1]) / (dataPoints[i+1][0] - dataPoints[i][0]);
                return ((dataPoints[i][1] + deltaX * coefficient)/scaleCoefficient).toFixed(2);
            }
        }
    }

    _renderBars() {
        const barSpace = this._options.barSpace;
        const barWidth = (this._rootWidth - barSpace*(this._dataLen - 1))/this._dataLen;
        let maxData = Math.max.apply(null, this._data);
        const minData = Math.min.apply(null, this._data);
        let verticalShift = 0;
        if (minData < 0) {
            maxData += Math.abs(minData);
            verticalShift = (Math.abs(minData) / maxData) * this._rootHeight;
        }
        let barsTemplate = ``;
        
        for (let i = 0; i < this._dataLen; i++) {
            let shift = i === 0 ? 0 : barSpace;
            let barHeight = (this._data[i] / maxData) * this._rootHeight;
            barsTemplate += `<path ${this._data[i] > 0 ? `class="sparkliner__bar"` : `class="sparkliner__bar sparkliner__bar--underzero"`} data-bar-value="${this._data[i]}" d="M${i*(barWidth+barSpace)} ${this._rootHeight - verticalShift} L${i*(barWidth+barSpace)} ${this._rootHeight - barHeight - verticalShift} L${i*(barWidth+barSpace)+barWidth} ${this._rootHeight - barHeight - verticalShift} L${i*(barWidth+barSpace)+barWidth} ${this._rootHeight - verticalShift} Z" />`;
        }
        const htmlTemplate = `<svg class="sparkliner" height="${this._rootHeight}" width="${this._rootWidth}">${barsTemplate}</svg>`;
        this._root.innerHTML = htmlTemplate; 

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if (target.tagName == "path") {
                    let targetData = target.getAttribute("data-bar-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }

    _renderDots() {
        const dotStep = this._rootWidth / this._dataLen;
        let maxData = Math.max.apply(null, this._data);
        const dotRadius = this._options.dotRadius;
        const minData = Math.min.apply(null, this._data);
        let verticalShift = 0;
        if (minData < 0) {
            maxData += Math.abs(minData);
            verticalShift = (Math.abs(minData) / maxData) * this._rootHeight;
        }
        let dotsTemplate = ``;

        for (let i = 0; i < this._dataLen; i++) {
            let centerHeight = ((this._data[i] / maxData) * this._rootHeight) - dotRadius;
            centerHeight = centerHeight > 0 ? centerHeight : centerHeight + 2 * dotRadius;
            dotsTemplate += `<g data-dot-value="${this._data[i]}">
                <circle ${this._data[i] > 0 ? `class="sparkliner__dot"` : `class="sparkliner__dot sparkliner__dot--underzero"`} cx="${i * dotStep + dotStep/2}" cy="${this._rootHeight - centerHeight - verticalShift}" r="${dotRadius}" />
                ${this._options.dotVerticalLine ? `<line ${this._data[i] > 0 ? `class="sparkliner__dotline"` : `class="sparkliner__dotline sparkliner__dotline--underzero"`} class="sparkliner__dotline" x1="${i * dotStep + dotStep/2}" y1="${this._rootHeight - centerHeight - verticalShift}" x2="${i * dotStep + dotStep/2}" y2="${this._rootHeight - verticalShift}" />` : ''}
                </g>`;
        }
        const htmlTemplate = `<svg class="sparkliner" height="${this._rootHeight}" width="${this._rootWidth}">${dotsTemplate} ${minData < 0 ? `<line class="sparkliner__horizontal-axe" x1="0" y1="${this._rootHeight - verticalShift}" x2="${this._rootWidth}" y2="${this._rootHeight - verticalShift}" />` : ``}</svg>`;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if ((target.tagName == "circle" || target.tagName == "line") && target.parentElement.tagName == "g") {
                    let targetData = target.parentElement.getAttribute("data-dot-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }

    _renderPolygon() {
        const scaleStep = this._rootWidth / (this._dataLen - 1);
        
        let maxData = Math.max.apply(null, this._data);
        const minData = Math.min.apply(null, this._data);
        let verticalShift = 0;
        if (minData < 0) {
            maxData += Math.abs(minData);
            verticalShift = (Math.abs(minData) / maxData) * this._rootHeight;
        }
        const scaleCoefficient = this._rootHeight / maxData;

        const dataPoints = this._data.map((item, index) => {
            return [index * scaleStep, (item / maxData) * this._rootHeight];
        });
        let polygonsPoints = [[0, 0]];
        for (let i = 0; i < dataPoints.length; i++) {
                if (dataPoints[i+1]) {
                    if (dataPoints[i][1] < 0 && dataPoints[i+1][1] > 0) {
                        polygonsPoints.push(dataPoints[i]);
                        polygonsPoints.push([this._calculateIntersection(dataPoints[i], dataPoints[i+1], scaleStep), 0]);
                    } else if (dataPoints[i][1] > 0 && dataPoints[i+1][1] < 0) {
                        polygonsPoints.push(dataPoints[i]);
                        polygonsPoints.push([this._calculateIntersection(dataPoints[i], dataPoints[i+1], scaleStep), 0]);
                    } else {
                        polygonsPoints.push(dataPoints[i]);
                    }
                } else {
                    polygonsPoints.push(dataPoints[i]);
                }
        }
        polygonsPoints.push([this._rootWidth, 0]);
        let polygonsPositive = [];
        let polygonsNegative = [];
        let polygon = [];
        for (let i = 0; i < polygonsPoints.length; i++) {
            if (i == 0) {
                polygon.push(polygonsPoints[i].join(","));
            } else if (i == polygonsPoints.length) {
                polygon.push(polygonsPoints[i].join(","));
                if (polygonsPoints[i][1] > 0) {
                    polygonsPositive.push(polygon);
                } else if (polygonsPoints[i][1] < 0) {
                    polygonsNegative.push(polygon);
                } else {
                    if (polygonsPoints[i-1][1] > 0) {
                        polygonsPositive.push(polygon);
                    } else if (polygonsPoints[i-1][1] < 0) {
                        polygonsNegative.push(polygon);
                    }
                }
            } else {
                if (polygonsPoints[i][1] == 0) {
                    polygon.push(polygonsPoints[i].join(","));
                    if (polygonsPoints[i-1][1] > 0) {
                        polygonsPositive.push(polygon);
                    } else {
                        polygonsNegative.push(polygon);
                    }
                    polygon = [];
                    polygon.push(polygonsPoints[i].join(","));
                } else {
                    polygon.push(polygonsPoints[i].join(","));
                }
            }
        }

        polygonsPositive = polygonsPositive.map((item) => {
            item = item.map((point) =>{
                return [point.split(",")[0], this._rootHeight - verticalShift - point.split(",")[1]].join(",");
            });
            return item.join(" ");
        });
        polygonsNegative = polygonsNegative.map((item) => {
            item = item.map((point) =>{
                return [point.split(",")[0], this._rootHeight - verticalShift - point.split(",")[1]].join(",");
            });
            return item.join(" ");
        });

        let positiveTemplate = ``;
        let negativeTemplate = ``;

        for (let i of polygonsPositive) {
            positiveTemplate += `<polygon class="sparkliner__polygon-positive" points="${i}" />`;
        }
        for (let i of polygonsNegative) {
            negativeTemplate += `<polygon class="sparkliner__polygon-negative" points="${i}" />`;
        }

        const htmlTemplate = `
            <svg class="sparkliner" height="${this._rootHeight}" width="${this._rootWidth}">
                ${positiveTemplate}
                ${negativeTemplate}
                ${this._options.lineShowCursor ? `<line class="sparkliner__polygon-cursor" x1="0" y1="${this._rootHeight}" x2="0" y2="0" />` : ""}
            </svg>
        `;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            let cursor = this._root.firstElementChild.lastElementChild;
            this._root.firstElementChild.addEventListener("mousemove", (e) => {
                let leftOffset = this._root.getBoundingClientRect().left;
                let leftBorder = this._root.clientLeft;
                let paddingLeft = parseInt(getComputedStyle(this._root, null).getPropertyValue("padding-left"));
                let inPosition = e.pageX - leftOffset - leftBorder - paddingLeft;
                let calculatedY = this._positionToValue(inPosition, dataPoints, scaleCoefficient);
                this._tooltip.innerText = calculatedY;
                if (typeof calculatedY !== "undefined") {
                    this._tooltip.style.visibility = "visible";
                    if (this._options.lineShowCursor) {
                        cursor.style.visibility = "visible";
                    }   
                } else {
                    this._tooltip.style.visibility = "hidden";
                    if (this._options.lineShowCursor) {
                        cursor.style.visibility = "hidden";
                    }    
                }
                if (this._options.lineShowCursor) {
                    cursor.setAttribute("x1",`${inPosition}`);
                    cursor.setAttribute("x2",`${inPosition}`);
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
                cursor.style.visibility = "hidden";
            });
        }

    }

    _renderHistogram() {
        const barSpace = this._options.histogramBarSpace;
        const barWidth = (this._rootWidth - barSpace * (this._options.histogramBarCount - 1)) / this._options.histogramBarCount;
        const minValue = Math.min.apply(null, this._data);
        const rangeStepValue = (Math.max.apply(null, this._data) - Math.min.apply(null, this._data)) / this._options.histogramBarCount;

        let barWeights = [];
        for (let i = 0; i < this._options.histogramBarCount; i++) {
            let rangeLeftBorder = i * rangeStepValue + minValue;
            let rangeRightBorder = rangeLeftBorder + rangeStepValue;
            let barRelativeWeight = this._data.filter((item) => {
                return (item >= rangeLeftBorder && item <= rangeRightBorder);
            }).length;
            barWeights.push(barRelativeWeight);
        }
        const barHeightStep = this._rootHeight / Math.max.apply(null, barWeights);

        let barsTemplate = ``;
        for (let i = 0; i < this._options.histogramBarCount; i++) {
            let barHeight = barWeights[i] * barHeightStep;
            barsTemplate += `<path class="sparkliner__histogram-bar" data-bar-value="(${(minValue + i * rangeStepValue).toFixed(1)}-${(rangeStepValue + minValue + i * rangeStepValue).toFixed(1)}):${barWeights[i]}" d="
                M${i*(barWidth+barSpace)} ${this._rootHeight} 
                L${i*(barWidth+barSpace)} ${this._rootHeight - barHeight} 
                L${i*(barWidth+barSpace) + barWidth} ${this._rootHeight - barHeight} 
                L${i*(barWidth+barSpace) + barWidth} ${this._rootHeight} 
            Z" />`;
        }
        const htmlTemplate = `<svg class="sparkliner" height="${this._rootHeight}" width="${this._rootWidth}">${barsTemplate}</svg>`;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if (target.tagName == "path") {
                    let targetData = target.getAttribute("data-bar-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }

    _renderProgressGradient() {
        let dataFill;
        let dataEntire;
        if (!Array.isArray(this._data) && this._data <= 100) {
            dataFill = this._data;
            dataEntire = 100;
        } else if (Array.isArray(this._data) && (this._dataLen === 2) && (this._data[0] < this._data[1])) {
            dataFill = this._data[0];
            dataEntire = this._data[1];
        }
        const linePosition = (dataFill / dataEntire) * this._rootWidth;

        let innerTemplate = `
        <line class="sparkliner__progressgradient-line" data-progress-value="${dataFill} / ${dataEntire}" x1="${linePosition}" y1="${this._rootHeight + this._options.progressGradientLineOverflow}" x2="${linePosition}" y2="${-this._options.progressGradientLineOverflow}" />
        <text class="sparkliner__progressgradient-text" data-progress-value="${dataFill} / ${dataEntire}" x="${this._rootWidth/2}" y="${this._rootHeight/2}" text-anchor="middle" alignment-baseline="middle" dominant-baseline="middle" >${((dataFill / dataEntire)*100).toFixed(2)}%</text>
        `;
        const htmlTemplate = `<svg class="sparkliner sparkliner__progressgradient" data-progress-value="${dataFill} / ${dataEntire}" style="overflow:visible" height="${this._rootHeight}" width="${this._rootWidth}">${innerTemplate}</svg>`;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if (target.tagName == "svg" || target.tagName == "line" || target.tagName == "text") {
                    let targetData = target.getAttribute("data-progress-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }

    _renderProgressStep() {
        let dataFill;
        let dataEntire;
        if (!Array.isArray(this._data) && this._data <= 100) {
            dataFill = this._data;
            dataEntire = 100;
        } else if (Array.isArray(this._data) && (this._dataLen === 2) && (this._data[0] < this._data[1])) {
            dataFill = this._data[0];
            dataEntire = this._data[1];
        }
        const linePosition = (dataFill / dataEntire) * this._rootWidth;

        const innerTemplate = `
            <path class="sparkliner__progressstep-complete" data-progress-value="${dataFill} / ${dataEntire}" d="M0 0 L0 ${this._rootHeight} L${linePosition} ${this._rootHeight} L${linePosition} 0 Z" />
            <path class="sparkliner__progressstep-incomplete" data-progress-value="${dataFill} / ${dataEntire}" d="M${linePosition} 0 L${linePosition} ${this._rootHeight} L${this._rootWidth} ${this._rootHeight} L${this._rootWidth} 0 Z" />
            <line class="sparkliner__progressstep-line" data-progress-value="${dataFill} / ${dataEntire}" x1="${linePosition}" y1="${this._rootHeight + this._options.progressStepLineOverflow}" x2="${linePosition}" y2="${-this._options.progressStepLineOverflow}" />
            <text class="sparkliner__progressstep-text" data-progress-value="${dataFill} / ${dataEntire}" x="${this._rootWidth/2}" y="${this._rootHeight/2}" text-anchor="middle" alignment-baseline="middle" dominant-baseline="middle" >${(dataFill * 100 / dataEntire).toFixed(2)}%</text>
        `;
        const htmlTemplate = `<svg class="sparkliner" style="overflow:visible" height="${this._rootHeight}" width="${this._rootWidth}">${innerTemplate}</svg>`;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if (target.tagName == "path" || target.tagName == "line" || target.tagName == "text") {
                    let targetData = target.getAttribute("data-progress-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }

    _renderProgressCircle() {
        const radius = this._rootHeight / 2;
        let dataFill;
        let dataEntire;
        if (!Array.isArray(this._data) && this._data <= 100) {
            dataFill = this._data == 100 ? dataFill = 99.9999 : this._data;
            dataEntire = 100;

        } else if (Array.isArray(this._data) && (this._dataLen === 2) && (this._data[0] <= this._data[1])) {
            dataFill = this._data[0] == 100 ? dataFill = 99.9999 : this._data[0];
            dataEntire = this._data[1];
        }
        const angle = (dataFill / dataEntire) * 2 * Math.PI;
        const circleCenterX = this._rootWidth / 2 + radius;
        const circleCenterY = this._rootHeight / 2;
        const stopX = circleCenterX + radius * (Math.cos(Math.PI/2 - angle));
        const stopY = circleCenterY + radius * (-Math.sin(Math.PI/2 - angle));

        const innerTemplate = `
            <text class="sparkliner__circle-text" data-circle-value="${dataFill} / ${dataEntire}" x="${this._rootWidth/2 - 3}" y="${this._rootHeight/2}" text-anchor="end" alignment-baseline="middle" dominant-baseline="middle">
                ${(dataFill * 100 / dataEntire).toFixed(1)}%
            </text>
            <circle class="sparkliner__circle-incomplete" data-circle-value="${dataFill} / ${dataEntire}" cx="${circleCenterX}" cy="${circleCenterY}" r="${radius}"/>
            <path class="sparkliner__circle-complete" data-circle-value="${dataFill} / ${dataEntire}" 
                d="M${circleCenterX},${0}
                A${radius},${radius} 0 ${angle <= Math.PI ? "0,1" : "1,1"} ${stopX},${stopY} 
                L${circleCenterX},${circleCenterY} 
                Z" 
            />
        `;
        const htmlTemplate = `<svg class="sparkliner" style="overflow:visible" height="${this._rootHeight}" width="${this._rootWidth}">${innerTemplate}</svg>`;
        this._root.innerHTML = htmlTemplate;

        if (this._options.showTooltips) {
            this._root.addEventListener("mousemove", (e) => {
                let target = e.target;
                if (target.tagName == "path" || target.tagName == "circle" || target.tagName == "text") {
                    let targetData = target.getAttribute("data-circle-value");
                    this._tooltip.innerText = targetData;
                    this._tooltip.style.visibility = "visible";
                } else {
                    this._tooltip.style.visibility = "hidden";
                }
            });
            this._root.addEventListener("mouseleave", () => {
                this._tooltip.style.visibility = "hidden";
            });
        }
    }
};