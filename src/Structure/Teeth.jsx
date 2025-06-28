export class Teeth {
    constructor(teethController, id, posx, posy) {
        this.m_Exists = true;
        this.m_Implant = false;
        this.Id = id;
        
        this.m_ProbingDepth = { a:0, b:0, c:0 };
        this.m_ProbingDepthL = { a:0, b:0, c:0 };
        this.m_GingivalMargin = { a:0, b:0, c:0 };
        this.m_GingivalMarginL = { a:0, b:0, c:0 };
        
        this.m_ImgFront = new Image();
        this.m_ImgLing = new Image();
        this.m_ImgImplantFront = new Image();
        this.m_ImgImplantLing = new Image();
        this.m_Rect = { x:posx, y:posy, w:102, h:239 };
    
        this.m_BleedOnProbing = {a:false, b:false, c:false};
        this.m_HasPlaque = {a:false, b:false, c:false};
        this.m_BleedOnProbingL = {a:false, b:false, c:false};
        this.m_HasPlaqueL = {a:false, b:false, c:false};
        this.m_Furcation = {m:0, d:0, c:0};
    
        this.offset = (this.Id > 30) ? 135 : 105;
        this.sign = (this.Id > 30) ? 1 : -1;
        this.teethController = teethController;
    }

    getTeethOnLeft(id) {
        try{
        return this.teethController.Charting.getTeethOnLeft(id);
        }catch(e){
            console.log("getTeethOnLeft", id);

            console.error(e);
        }
    }

    getTeethOnRight(id) {
        return this.teethController.Charting.getTeethOnRight(id);
    }

    drawImages(ctx) {
        if (this.m_Implant) {
            ctx.drawImage(this.m_ImgImplantFront, this.m_Rect.x, this.m_Rect.y);
        } else {
            ctx.drawImage(this.m_ImgFront, this.m_Rect.x, this.m_Rect.y);
        }
    }

    clearRect(ctx) {
        ctx.clearRect(this.m_Rect.x, this.m_Rect.y, this.m_Rect.w, this.m_Rect.h * 2);
    }

    drawLines(ctx, wireframe) {
        /* premod, draw in about 2500µs */
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.m_Rect.x, this.m_Rect.y)
        ctx.lineTo(this.m_Rect.x + this.m_Rect.w, this.m_Rect.y);
        ctx.lineTo(this.m_Rect.x + this.m_Rect.w, this.m_Rect.y + this.m_Rect.h);
        ctx.lineTo(this.m_Rect.x, this.m_Rect.y + this.m_Rect.h);
        ctx.clip();

        var left = this.getTeethOnLeft(this.Id);
        var right = this.getTeethOnRight(this.Id);
        var sg_hg = this.sign * this.teethController.Charting.HEIGHT_STEP;
        var x_1_4 = this.m_Rect.x + this.m_Rect.w * 1 / 4;
        var x_2 = this.m_Rect.x + this.m_Rect.w / 2;
        var x_3_4 = this.m_Rect.x + this.m_Rect.w * 3 / 4;
        var Top_V = this.m_Rect.y + this.m_Rect.h - this.offset;
        var Top_L = this.m_Rect.y + this.m_Rect.h * 2 - this.offset;
        
        //debug
        wireframe = false;
        
        var p0, p1, p2, p3, p4;

        if(left && left.m_Exists) {
            p0 = {
                x: left.m_Rect.x + left.m_Rect.w * 3 / 4,
                y: (left.m_Rect.y + left.m_Rect.h - this.offset) + 
                   (left.m_ProbingDepth.c + left.m_GingivalMargin.c) * sg_hg
            };
            p1 = {
                x: x_1_4,
                y: (Top_V) + (this.m_ProbingDepth.a + this.m_GingivalMargin.a) * sg_hg
            };
        } else {
            p0 = {
                x: x_1_4, 
                y: (Top_V) + (this.m_ProbingDepth.a + this.m_GingivalMargin.a) * sg_hg
            };
        }

        p2 = {
            x: x_2, 
            y: (Top_V) + (this.m_ProbingDepth.b + this.m_GingivalMargin.b) * sg_hg
        };
        p3 = {
            x: x_3_4, 
            y: (Top_V) + (this.m_ProbingDepth.c + this.m_GingivalMargin.c) * sg_hg
        };

        if(right && right.m_Exists) {
            p4 = {
                x: right.m_Rect.x + right.m_Rect.w * 1 / 4, 
                y: (right.m_Rect.y + right.m_Rect.h - this.offset) + 
                   (right.m_ProbingDepth.a + right.m_GingivalMargin.a) * sg_hg
            };
        }
        
        var p5, p6, p7, p8, p9;
        if(left && left.m_Exists) {
            p5 = { 
                x: left.m_Rect.x + left.m_Rect.w * 3 / 4, 
                y: (left.m_Rect.y + left.m_Rect.h - this.offset) + 
                   (left.m_GingivalMargin.c) * sg_hg 
            };
            p6 = { 
                x: x_1_4, 
                y: (Top_V) + (this.m_GingivalMargin.a) * sg_hg 
            };
        } else {
            p5 = { 
                x: x_1_4, 
                y: (Top_V) + (this.m_GingivalMargin.a) * sg_hg 
            };
        }
        
        p7 = { 
            x: x_2, 
            y: (Top_V) + (this.m_GingivalMargin.b) * sg_hg 
        };
        p8 = { 
            x: x_3_4, 
            y: (Top_V) + (this.m_GingivalMargin.c) * sg_hg 
        };
        
        if(right && right.m_Exists) {
            p9 = {
                x: right.m_Rect.x + right.m_Rect.w * 1 / 4, 
                y: (right.m_Rect.y + right.m_Rect.h - this.offset) + 
                   (right.m_GingivalMargin.a) * sg_hg
            };
        }
        
        if(wireframe == false) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            if(left && left.m_Exists)
                ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            if(right && right.m_Exists)
                ctx.lineTo(p4.x, p4.y);
            if(right && right.m_Exists)
                ctx.lineTo(p9.x, p9.y);
            ctx.lineTo(p8.x, p8.y);
            ctx.lineTo(p7.x, p7.y);
            if(left && left.m_Exists)
                ctx.lineTo(p6.x, p6.y);
            ctx.lineTo(p5.x, p5.y);
            ctx.closePath();
            ctx.fillStyle = '#00f';
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        if(left && left.m_Exists)
            ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        if(right && right.m_Exists)
            ctx.lineTo(p4.x, p4.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.teethController.Charting.PDColor;
        if (this.m_Furcation.c != 0.0)
            ctx.strokeStyle = 'yellow';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p5.x, p5.y);
        if(left && left.m_Exists)
            ctx.lineTo(p6.x, p6.y);
        ctx.lineTo(p7.x, p7.y);
        ctx.lineTo(p8.x, p8.y);
        if(right && right.m_Exists)
            ctx.lineTo(p9.x, p9.y);

        ctx.lineWidth = 2;
        ctx.strokeStyle = this.teethController.Charting.GMColor;
        ctx.stroke();
    
        if(wireframe == false) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            if(left && left.m_Exists)
                ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            if(right && right.m_Exists)
                ctx.lineTo(p4.x, p4.y);
            if(right && right.m_Exists)
                ctx.lineTo(p9.x, p9.y);
            ctx.lineTo(p8.x, p8.y);
            ctx.lineTo(p7.x, p7.y);
            if(left && left.m_Exists)
                ctx.lineTo(p6.x, p6.y);
            ctx.lineTo(p5.x, p5.y);
            ctx.closePath();
            ctx.fillStyle = '#00f';
            ctx.globalAlpha = 0.2;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();
    }
    
    draw(ctx, wireframe) {
        var left = this.getTeethOnLeft(this.Id);
        var right = this.getTeethOnRight(this.Id);
        
        if (left) {
            left.clearRect(ctx);
            if(left.m_Exists)
                left.drawImages(ctx);
        }	
        if (right) {
            right.clearRect(ctx);
            if(right.m_Exists)
                right.drawImages(ctx);
        }
        this.clearRect(ctx);

        if (this.m_Exists) {
            this.drawImages(ctx);
            this.drawLines(ctx, wireframe);	
        }
        if (left && left.m_Exists)
            left.drawLines(ctx, wireframe);
        if (right && right.m_Exists)
            right.drawLines(ctx, wireframe);
    }
}
