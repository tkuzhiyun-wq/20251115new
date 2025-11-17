let minSide;
let objs = [];
let colors = ['#ed3441', '#ffd630', '#329fe3', '#08AC7E', '#DED9DF', '#FE4D03'];

function setup() {
    // 建立與視窗等大的畫布並初始化尺寸參數
    createCanvas(windowWidth, windowHeight);
    minSide = min(width, height);

    rectMode(CENTER);

    // 新增：左側「作品筆記」按鈕與 iframe 覆蓋層
    const noteUrl = 'https://hackmd.io/@KsqNQqBTRk6MdWHQEubr9A/rkTvYYBJbg';

    // 不另設選單，嘗試從現有 DOM 選單取得「作品筆記」元素
    let noteEl = Array.from(document.querySelectorAll('a, button, li, span'))
        .find(el => el.textContent && el.textContent.trim().includes('作品筆記'));

    // 若找不到，則建立按鈕作為後備（但優先仍使用現有選單）
    if (!noteEl) {
        console.warn('找不到選單中的「作品筆記」，已建立後備按鈕。');
        noteEl = createButton('作品筆記');
        noteEl.position(16, 80);
        noteEl.style('padding', '6px 10px');
        noteEl.style('background', 'rgba(0,0,0,0.6)');
        noteEl.style('color', '#fff');
        noteEl.style('border', 'none');
        noteEl.style('border-radius', '4px');
        noteEl.style('z-index', '1100');
        noteEl.style('font-family', 'sans-serif');
    }
    
    // 覆蓋層（初始隱藏）
    let overlay = createDiv();
    overlay.style('position', 'fixed');
    overlay.style('top', '0');
    overlay.style('left', '0');
    overlay.style('width', '100%');
    overlay.style('height', '100%');
    overlay.style('background', 'rgba(0,0,0,0.75)');
    overlay.style('display', 'flex');
    overlay.style('align-items', 'center');
    overlay.style('justify-content', 'center');
    overlay.style('z-index', '2000');
    overlay.style('padding', '20px');
    overlay.hide();

    // iframe
    let ifr = createElement('iframe');
    ifr.attribute('src', 'about:blank');
    ifr.style('width', '90%');
    ifr.style('height', '90%');
    ifr.style('border', '1px solid rgba(255,255,255,0.1)');
    ifr.style('border-radius', '6px');
    ifr.parent(overlay);

    // 關閉按鈕
    let closeBtn = createButton('關閉');
    closeBtn.parent(overlay);
    closeBtn.style('position', 'absolute');
    closeBtn.style('right', '24px');
    closeBtn.style('top', '24px');
    closeBtn.style('padding', '6px 10px');
    closeBtn.style('border-radius', '4px');
    closeBtn.style('background', 'rgba(255,255,255,0.08)');
    closeBtn.style('color', '#fff');
    closeBtn.style('border', 'none');
    closeBtn.style('z-index', '2100');

    // 綁定「作品筆記」點擊：支援原生 DOM 與 p5 元素
    const openNote = () => {
        ifr.attribute('src', noteUrl);
        overlay.show();
    };
    if (noteEl.mousePressed && typeof noteEl.mousePressed === 'function') {
        // p5.Element（createButton 回傳）
        noteEl.mousePressed(openNote);
    } else if (noteEl.addEventListener) {
        // 原生 DOM 元素
        noteEl.addEventListener('click', (e) => {
            e.preventDefault();
            openNote();
        });
    }

    // 點擊關閉按鈕關閉並清空 src（停止載入）
    closeBtn.mousePressed(() => {
        ifr.attribute('src', 'about:blank');
        overlay.hide();
    });

    // 點擊覆蓋層空白處關閉（避免點到 iframe 時觸發）
    overlay.elt.addEventListener('click', (e) => {
        const tag = e.target.tagName;
        if (tag !== 'IFRAME' && tag !== 'BUTTON') {
            ifr.attribute('src', 'about:blank');
            overlay.hide();
        }
    });
}

function draw() {
	background(0);
	for (let i of objs) {
		i.run();
	}

	for (let i = 0; i < objs.length; i++) {
		if (objs[i].isDead) {
			objs.splice(i, 1);
		}
	}

	if (frameCount % (random([10, 60, 120])) == 0) {
		addObjs();
	}

	// 在畫布中間顯示文字「教育科技學系414730100許○云」
	push();
	textAlign(CENTER, CENTER);
	textSize(minSide * 0.1);
	fill(255);
	text('教育科技學系414730100許○云', width / 2, height / 2);
	pop();
}

function windowResized() {
	// 當視窗大小改變時調整畫布尺寸與參數
	resizeCanvas(windowWidth, windowHeight);
	minSide = min(width, height);
}

function addObjs() {
	let x = random(-0.1, 1.1) * width;
	let y = random(-0.1, 1.1) * height;
	
	for (let i = 0; i < 20; i++) {
		objs.push(new Orb(x, y));
	}

	for (let i = 0; i < 50; i++) {
		objs.push(new Sparkle(x, y));
	}
	
	for (let i = 0; i < 2; i++) {
		objs.push(new Ripple(x, y));
	}

	for (let i = 0; i < 10; i++) {
		objs.push(new Shapes(x, y));
	}
}

function easeOutCirc(x) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

class Orb {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = 0;
		this.maxRadius = minSide * 0.03;
		this.rStep = random(1);
		this.maxCircleD = minSide * 0.005;
		this.circleD = minSide * 0.005;
		this.isDead = false;
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.3, 0.1);
		this.xStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.yStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.life = 0;
		this.lifeSpan = int(random(50, 180));
		this.col = random(colors);
		this.pos = [];
		this.pos.push(createVector(this.x, this.y));
		this.followers = 10;
	}

	show() {
		this.xx = this.x + this.radius * cos(this.ang);
		this.yy = this.y + this.radius * sin(this.ang);
		push();
		noStroke();
		noFill();
		stroke(this.col);
		strokeWeight(this.circleD);
		beginShape();
		for (let i = 0; i < this.pos.length; i++) {
			vertex(this.pos[i].x, this.pos[i].y);
		}
		endShape();
		pop();
	}

	move() 	{
		this.ang += this.angStep;
		this.x += this.xStep;
		this.y += this.yStep;
		this.radius += this.rStep;
		this.radius = constrain(this.radius, 0, this.maxRadius);
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		this.circleD = map(this.life, 0, this.lifeSpan, this.maxCircleD, 1);
		this.pos.push(createVector(this.xx, this.yy));
		if (this.pos.length > this.followers) {
			this.pos.splice(0, 1);
		}
	}
	run() {
		this.show();
		this.move();
	}
}

class Sparkle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
		this.life = 0;
		this.lifeSpan = int(random(50, 280));
		this.col = random(colors);
		this.sw = minSide * random(0.01)
	}

	show() {
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (random() < 0.5) {
			point(this.x, this.y);
		}
	}

	move() {
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}
}


class Ripple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 150));
		this.col = random(colors);
		this.maxSw = minSide * 0.005;
		this.sw = minSide * 0.005;
		this.d = 0;
		this.maxD = minSide * random(0.1, 0.5);
	}

	show() {
		noFill();
		stroke(this.col);
		strokeWeight(this.sw);
		circle(this.x, this.y, this.d);
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.d = lerp(0, this.maxD, easeOutCirc(nrm));
	}

	run() {
		this.show();
		this.move();
	}
}

class Shapes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 222));
		this.col = random(colors);
		this.sw = minSide * 0.005;
		this.maxSw = minSide * 0.005;
		this.w = minSide * random(0.05);
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.05);
		this.shapeType = int(random(3));
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (this.shapeType == 0) {
			square(0, 0, this.w);
		} else if (this.shapeType == 1) {
			circle(0, 0, this.w);
		} else if (this.shapeType == 2) {
			line(0, this.w / 2, 0, -this.w / 2);
			line(this.w / 2, 0, -this.w / 2, 0);
		}
		pop();

	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.ang += this.angStep;
	}

	run() {
		this.show();
		this.move();
	}
}
