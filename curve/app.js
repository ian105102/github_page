// 取得 canvas 元素
const canvas2 = document.getElementById('layer2');
const canvas1 = document.getElementById('layer1');
const ctx2 = canvas2.getContext('2d');
const ctx1 = canvas1.getContext('2d');


// 定義 Point 類別
class Point {
    constructor(x, y, startControlVector, endControlVector) {
        this.x = x;
        this.y = y;
        this.startControlVector = startControlVector;
        this.endControlVector = endControlVector;
        this.pointRadius = 5;
    }

    // 計算向量的長度
    vectorLength(vector) {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2);
    }

    // 印出點與向量的資訊
    printPointInfo() {
        console.log(`Point: (${this.x}, ${this.y})`);
        console.log(`Vector 1: (${this.startControlVector.x}, ${this.startControlVector.y}), Length: ${this.vectorLength(this.startControlVector)}`);
        console.log(`Vector 2: (${this.endControlVector.x}, ${this.endControlVector.y}), Length: ${this.vectorLength(this.endControlVector)}`);
    }
    // 繪製點與向量
    drawPoint(ctx) {
        // 畫點
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'green';
        ctx.fill();

        // 畫向量1
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.startControlVector.x,  this.startControlVector.y);
        ctx.strokeStyle = 'red';
        ctx.stroke();

        // 畫向量2
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.endControlVector.x, this.endControlVector.y);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
}

// 定義 Line 類別
class Line {
    constructor(points) {
        this.points = points; // 將點儲存為陣列
    }

    // 迴圈走訪所有點並畫線
    draw(ctx, color = 'black', width = 1, dashed = false) {
        for (let i = 0; i < this.points.length - 1; i++) {
            const start = this.points[i];
            const end = this.points[i + 1];
            this.drawSegment(ctx, start, end, color, width, dashed);
        }
    }
    // 繪製單一線段
    static drawSegment(ctx, start, end, color = 'black', width = 1, dashed = false) {
        ctx.beginPath();
        ctx.setLineDash(dashed ? [5, 5] : []); // 設定虛線樣式
        ctx.strokeStyle = color;              // 線條顏色
        ctx.lineWidth = width;                // 線條寬度
        ctx.lineCap = 'round';                // 線條端點樣式
        ctx.moveTo(start.x, start.y);         // 起點
        ctx.lineTo(end.x, end.y);             // 終點
        ctx.stroke();
        ctx.setLineDash([]); // 重置為實線
    }


}


class Curve {
    constructor(points) {
        // 確保所有點結構正確，並儲存為陣列
        this.points = points;
    }

    // 繪製 Hermite 样条曲線
    drawHermiteSpline(ctx, steps = 100, color = 'black', width = 1) {
        for (let i = 0; i < this.points.length - 1; i++) {
            const Point1 = this.points[i];
            const Point2 = this.points[i + 1];

            let tempX = Point1.x;
            let tempY = Point1.y;

            for (let j = 0; j <= steps; j++) {
                const t = j / steps;

                const h1 = 2 * t ** 3 - 3 * t ** 2 + 1;
                const h2 = -2 * t ** 3 + 3 * t ** 2;
                const h3 = t ** 3 - 2 * t ** 2 + t;
                const h4 = t ** 3 - t ** 2;

                const x = h1 * Point1.x + h2 * Point2.x + h3 * -(Point1.x - Point1.startControlVector.x) + h4 * -(Point2.x - Point2.endControlVector.x);
                const y = h1 * Point1.y + h2 * Point2.y + h3 * -(Point1.y -Point1.startControlVector.y) + h4 * -(Point2.y - Point2.endControlVector.y);

                // 使用繪製片段函數
                Line.drawSegment(ctx, { x: tempX, y: tempY }, { x, y }, color, width);
                tempX = x;
                tempY = y;
            }
        }
    }
}

// 定義 PetalSeting 類別
class PetalSeting {
    constructor(petalCenterSize = 10, petalRadius = 100, petalCount = 6 , PetalWidth = 0.05 ) {
        this.petalCenterSize = petalCenterSize;
        this.petalRadius = petalRadius;
        this.petalCount = petalCount;
        this.PetalWidth = PetalWidth;
    }
}

class HomogeneousMatrix {
    constructor() {
        this.rotationMatrix = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1], // 齊次矩陣的固定值
        ];
    }

    static multiplyMatrix(matrixA, matrixB) {
        const result = Array.from({ length: 3 }, () => Array(3).fill(0));

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        return result;
    }
    ResetHomogeneousMatrix(){
        this.rotationMatrix = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1], // 齊次矩陣的固定值
        ];
    }
    AddShear(shearX, shearY) {
        const newShear = [
            [1, shearX, 0],
            [shearY, 1, 0],
            [0, 0, 1],
        ];
        // 更新旋轉矩陣為原矩陣乘以新旋轉矩陣
        this.rotationMatrix = HomogeneousMatrix.multiplyMatrix(this.rotationMatrix, newShear);
    }
    AddScale(ScaleX, ScaleY) {
        const newScale = [
            [ScaleX, 0, 0],
            [0, ScaleY, 0],
            [0, 0     , 1],
        ];
        // 更新旋轉矩陣為原矩陣乘以新旋轉矩陣
        this.rotationMatrix = HomogeneousMatrix.multiplyMatrix(this.rotationMatrix , newScale);
    }
    SetTranslation(translationX, translationY) {
        const newTranslation = [
            [1, 0, translationX],
            [0, 1, translationY],
            [0, 0, 1],
        ];
        // 更新旋轉矩陣為原矩陣乘以新旋轉矩陣
        this.rotationMatrix = HomogeneousMatrix.multiplyMatrix(this.rotationMatrix, newTranslation);
    }
    // 設定旋轉角度並疊加旋轉
    AddRotation(angleInRadians) {
        const cosTheta = Math.cos(angleInRadians);
        const sinTheta = Math.sin(angleInRadians);

        const newRotation = [
            [cosTheta, -sinTheta, 0],
            [sinTheta, cosTheta, 0],
            [0, 0, 1],
        ];
        // 更新旋轉矩陣為原矩陣乘以新旋轉矩陣
        this.rotationMatrix = HomogeneousMatrix.multiplyMatrix(this.rotationMatrix, newRotation);
    }

    // 應用旋轉矩陣到給定點 (x, y)
    ApplyToPoint(x, y, offsetX = 0, offsetY = 0) {
   
        const homogeneousPoint = [x - offsetX, y - offsetY, 1];
        const rotatedPoint = [
            this.rotationMatrix[0][0] * homogeneousPoint[0] +
            this.rotationMatrix[0][1] * homogeneousPoint[1] +
            this.rotationMatrix[0][2] * homogeneousPoint[2],

            this.rotationMatrix[1][0] * homogeneousPoint[0] +
            this.rotationMatrix[1][1] * homogeneousPoint[1] +
            this.rotationMatrix[1][2] * homogeneousPoint[2]
        ];

        return { x: rotatedPoint[0] + offsetX, y: rotatedPoint[1] + offsetY };
    }
}
class Curve_Object {
        constructor(centerX, centerY) {
            this.curves = [];
            this.StaticCurves = [];
            this.centerX = centerX;
            this.centerY = centerY;
            this.homogeneousMatrix = new HomogeneousMatrix();
        }

        AddCurve(curve) {
            this.curves.push(curve);
        }
        AddStaticCurve(curve) {
            this.StaticCurves.push(curve);
        }
        ResetTransform(){
            this.homogeneousMatrix.ResetHomogeneousMatrix();
        }
        AddRotate(angleInRadians) {
            this.homogeneousMatrix.AddRotation(angleInRadians);
        }
        AddScale(ScaleX, ScaleY) {
            this.homogeneousMatrix.AddScale(ScaleX, ScaleY);
        }
        AddTranslation(translationX, translationY) {
       
            this.homogeneousMatrix.SetTranslation(translationX, translationY);
        }
        AddShear(shearX, shearY) {
            this.homogeneousMatrix.AddShear(shearX, shearY);
        }
        ResetCurves(){
            for(let i = 0; i < this.curves.length; i++){
                for(let j = 0; j < this.curves[i].points.length; j++){
                    this.curves[i].points[j].x = this.StaticCurves[i].points[j].x;
                    this.curves[i].points[j].y = this.StaticCurves[i].points[j].y;
                    this.curves[i].points[j].startControlVector.x = this.StaticCurves[i].points[j].startControlVector.x;
                    this.curves[i].points[j].startControlVector.y = this.StaticCurves[i].points[j].startControlVector.y;
                    this.curves[i].points[j].endControlVector.x = this.StaticCurves[i].points[j].endControlVector.x;
                    this.curves[i].points[j].endControlVector.y = this.StaticCurves[i].points[j].endControlVector.y;
                }
            }
        }
        transformAndAssign = (point, matrix, centerX, centerY) => {
            const transformed = matrix.ApplyToPoint(point.x, point.y, centerX, centerY);
            point.x = transformed.x;
            point.y = transformed.y;
        };
        // 使用齊次座標進行旋轉
        ApplyStaticCurvesTransform() {
            this.StaticCurves.forEach((curve) => {
                curve.points.forEach((point) => {
                    // Transform the main point
                    this.transformAndAssign(point, this.homogeneousMatrix, this.centerX, this.centerY);
                    
                    // Transform the control vectors
                    this.transformAndAssign(point.startControlVector, this.homogeneousMatrix, this.centerX, this.centerY);
                    this.transformAndAssign(point.endControlVector, this.homogeneousMatrix, this.centerX, this.centerY);
                });
            });
        }

        // 使用齊次座標進行旋轉
        ApplyTransform() {
            this.curves.forEach((curve) => {
                curve.points.forEach((point) => {
                    // Transform the main point
                    this.transformAndAssign(point, this.homogeneousMatrix, this.centerX, this.centerY);
                    
                    // Transform the control vectors
                    this.transformAndAssign(point.startControlVector, this.homogeneousMatrix, this.centerX, this.centerY);
                    this.transformAndAssign(point.endControlVector, this.homogeneousMatrix, this.centerX, this.centerY);
                });
            });
        }
}

// 定義 Petal 類別
class Petal extends Curve_Object {
    constructor(centerX, centerY, petalSetting) {
        super(centerX, centerY);
        this.centerX = centerX;
        this.centerY = centerY;
        this.petalSetting = petalSetting;

        this.generatePetals(); // 抽離邏輯到獨立函數
    }
    setPetalSetting(arg1, arg2, arg3, arg4) {
        if (typeof arg1 === 'object') {
            // 如果傳入的是一個物件
            this.petalSetting = arg1;
        } else {
            // 否則傳入的是四個數值
            this.petalSetting.petalCenterSize = arg1;
            this.petalSetting.petalRadius = arg2;
            this.petalSetting.petalCount = arg3;
            this.petalSetting.PetalWidth = arg4;
        }
    }
    

    generatePetals() {
        const { petalCount, petalRadius, petalCenterSize, PetalWidth } = this.petalSetting;
        const angleStep = (Math.PI * 2) / petalCount;
        const vectorScale = petalRadius * 0.8;

        this.curves = [];
        for (let i = 0; i < petalCount; i++) {
            const startAngle = i * angleStep;
            const endAngle = (i + 1) * angleStep;

            const startX = this.centerX + Math.cos(startAngle) * petalCenterSize;
            const startY = this.centerY + Math.sin(startAngle) * petalCenterSize;
            const endX = this.centerX + Math.cos(endAngle) * petalCenterSize;
            const endY = this.centerY + Math.sin(endAngle) * petalCenterSize;

            const startControlVector1 = {
                x: Math.cos(startAngle - Math.PI * PetalWidth) * vectorScale + startX,
                y: Math.sin(startAngle - Math.PI * PetalWidth) * vectorScale + startY,
            };
            const endControlVector1 = {
                x: endX,
                y: endY,
            };
            const startControlVector2 = {
                x: startX,
                y: startY,
            };
            const endControlVector2 = {
                x: Math.cos(endAngle - Math.PI + Math.PI * PetalWidth) * vectorScale + endX,
                y: Math.sin(endAngle - Math.PI + Math.PI * PetalWidth) * vectorScale + endY,
            };

            const startPoint = new Point(startX, startY, startControlVector1, endControlVector1);
            const endPoint = new Point(endX, endY, startControlVector2, endControlVector2);

            let curve = new Curve([startPoint, endPoint]);
            this.AddCurve(curve);
            const deepCopiedCurve = JSON.parse(JSON.stringify(curve));
            this.AddStaticCurve(deepCopiedCurve);
        }
    }

    drawFlower(ctx, color = 'red', width = 1) {
        this.curves.forEach((curve) => {
            curve.drawHermiteSpline(ctx, 100, color, width);
        });
    }
    drawShowTransform(ctx,color = 'red', width = 1) {
        this.curves.forEach((curve) => {
            curve.drawHermiteSpline(ctx, 100, color, width);
        });
    }

    drawPoint(ctx) {
        this.curves.forEach((curve) => {
            curve.points.forEach((point) => {
                point.drawPoint(ctx);
            });
        });
    }
}

const clearCanvasButton = document.getElementById('clear');
clearCanvasButton.addEventListener('click', ()=>{
    clearCanvas1();
});
const submitButton = document.getElementById('submit');
submitButton.addEventListener('click', () => { 
    ctx1.drawImage(canvas2, 0, 0);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    Temflower = null;
});
const clearTempButton = document.getElementById('clearTemp');
clearTempButton.addEventListener('click', () => {
    clearCanvas2();
    Temflower = null;
});


const resetTransferButton = document.getElementById('resetTransfer');
resetTransferButton.addEventListener('click', () => { 

    resetOrderWithAPI();
    clearCanvas2();
    
    inputs.rotationAngle.value = 0;
    inputs.translationX.value = 0;
    inputs.translationY.value = 0;
    inputs.scaleX.value = 1;
    inputs.scaleY.value = 1;
    inputs.shearX.value = 0;
    inputs.shearY.value = 0;

    InitializeValues(); 
    updateViewValues();
    updateFlower();
});
const resetSettingButton = document.getElementById('resetSetting');
resetSettingButton.addEventListener('click', () => { 
    
    clearCanvas2();
    inputs.colorPicker.value = "#e66465";
    inputs.petalCount.value = 5;
    inputs.innerRadius.value = 30;
    inputs.outerRadius.value = 250;
    inputs.petalWidth.value = 0.05;
    inputs.lineWidth.value = 5;
    InitializeValues(); 
    updateFlower();
    updateViewValues();

});

// 取得輸入框
const inputs = {
    colorPicker: document.getElementById("colorPicker"),
    petalCount: document.getElementById("petalCount"),
    innerRadius: document.getElementById("innerRadius"),
    outerRadius: document.getElementById("outerRadius"),
    petalWidth: document.getElementById("petalWidth"),
    lineWidth: document.getElementById("lineWidth"),

    rotationAngle: document.getElementById("rotationAngle"),

    translationX: document.getElementById("translationX"),
    translationY: document.getElementById("translationY"),

    scaleX: document.getElementById("scaleX"),
    scaleY: document.getElementById("scaleY"),

    shearX: document.getElementById("shearX"),
    shearY: document.getElementById("shearY"),
};

// 當前值儲存

// 更新函式
function updateValues(event) {
    const id = event.target.id; // 獲取觸發事件的輸入框 ID
    if (id === "colorPicker") {
        values[id] = event.target.value; // 顏色
    } else {
        values[id] = parseFloat(event.target.value) || 0; // 數值
    }
    updateFlower();
}


const values = {};
let Temflower;
let sortedOrder =['rotationAngle','translation',  'scale', 'shear'];
// 初始化時執行更新
InitializeValues();
InitializeEvent();
updateViewValues();

function InitializeEvent() {
    Object.values(inputs).forEach(input => {
        if(input.id === "colorPicker")return;
        let id = input.id;
        let valueShower = document.getElementById(id + "Value");
        input.addEventListener('input', (event) => {
            valueShower.textContent = event.target.value;
            
        }) ;

    });
}

function updateViewValues(){
    Object.values(inputs).forEach(input => {
        if(input.id === "colorPicker")return;
        let id = input.id;
        let valueShower = document.getElementById(id + "Value");
        valueShower.innerHTML = input.value;
    });
}

// 初始化函式
function InitializeValues() {
    Object.keys(inputs).forEach(id => {
        const input = inputs[id];
        if (id === "colorPicker") {
            values[id] = input.value; // 初始化顏色
        } else {
            values[id] = parseFloat(input.value) || 0; // 初始化數值
        }
        
    });
}

Object.values(inputs).forEach(input => {
    input.addEventListener("input", updateValues); // 當輸入內容改變時觸發
});


function updateFlower() {
    clearCanvas2();
    Temflower.setPetalSetting(values.innerRadius, values.outerRadius, values.petalCount,values.petalWidth);

    Temflower.generatePetals();
    Temflower.ResetTransform();

    for (let i = sortedOrder.length - 1; i >= 0; i--) {
        const id = sortedOrder[i];
        switch (id) {
            case 'rotationAngle':
                Temflower.AddRotate(values.rotationAngle * Math.PI / 180);
                break;
            case 'scale':
                Temflower.AddScale(values.scaleX, values.scaleY);
                break;
            case 'translation':
                Temflower.AddTranslation(values.translationX, values.translationY);
                break;
            case 'shear':
                Temflower.AddShear(values.shearX, values.shearY);
                break;
        }
    }
    Temflower.ApplyTransform();
    
    Temflower.drawFlower(ctx2, values.colorPicker, values.lineWidth);
}

// 點擊事件：繪製花朵   
canvas2.addEventListener('click', (event) => {
    const rect = canvas2.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    clearCanvas2();
    const petalSetting = new PetalSeting(values.innerRadius, values.outerRadius, values.petalCount,values.petalWidth);

    Temflower = new Petal(x, y, petalSetting );
    for (let i = sortedOrder.length - 1; i >= 0; i--) {
        const id = sortedOrder[i];
        switch (id) {
            case 'rotationAngle':
                Temflower.AddRotate(values.rotationAngle * Math.PI / 180);
                break;
            case 'scale':
                Temflower.AddScale(values.scaleX, values.scaleY);
                break;
            case 'translation':
                Temflower.AddTranslation(values.translationX, values.translationY);
                break;
            case 'shear':
                Temflower.AddShear(values.shearX, values.shearY);
                break;
        }
    }

    Temflower.ApplyTransform();
    Temflower.drawFlower(ctx2, values.colorPicker, values.lineWidth);
}); 

// 清除畫布
function clearCanvas2() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
}
function clearCanvas1() {
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
}

const sortable = Sortable.create(listWithHandle, {
    handle: '.MoveIcon',
    animation: 150,
    onEnd: function () {
        sortedOrder = getSortedOrder();
        updateFlower();
    }
});
function getSortedOrder() {
    const listItems = document.querySelectorAll('#listWithHandle li');
    return Array.from(listItems).map(item => item.id); // 回傳項目的 data-id
}
const originalOrder = Array.from(document.querySelectorAll('#listWithHandle li')).map(item => item.dataset.id);
// 回復排序的函數
function resetOrderWithAPI() {
    sortable.sort(originalOrder); // 使用 Sortable.js 的排序方法
}