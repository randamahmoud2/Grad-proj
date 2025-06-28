import { Teeth } from "./Teeth";

export class ChartRenderer {
    constructor(arc, charting, teethController, canvas_id) {
        this.Teeth = new Array(16);
        this.leftToLoad = 32;
        this.Canvas = null;
        this.Context = null;
        this.Arc = arc;
        this.WireframeOnly = true;
        this.canvas_id = canvas_id;
        this.TeethController = teethController;
        this.Charting = charting;
        this.tooth_ids_upper = [];
        this.tooth_ids_lower = [];
    }
    
    initialise() {
        this.Canvas = document.getElementById(`vrc_display${this.canvas_id}`);
        
        if (!this.Canvas) {
            console.error(`Canvas element not found for ${this.Arc} arc`);
            return;
        }

        this.Canvas.width = 1632;
        this.Canvas.height = 300;
        this.Context = this.Canvas.getContext('2d');

        const m_CellWidth = this.Canvas.width / 16;

        this.tooth_ids_upper.length = 0;
        this.tooth_ids_lower.length = 0;
        
        if (this.canvas_id.toString() === "0" || this.canvas_id.toString() === "1") {
            switch (this.Arc) {
                case 'upper':
                    for (let i = 18; i >= 11; i--) {
                        const index = 18 - i;
                        this.Teeth[index] = new Teeth(this.TeethController, i, m_CellWidth * index, 0);
                        this.loadImages(this.Teeth[index], i);
                        this.tooth_ids_upper.push(i);
                    }
                    for (let i = 21; i <= 28; i++) {
                        const index = 7 + (i - 20);
                        this.Teeth[index] = new Teeth(this.TeethController, i, m_CellWidth * index, 0);
                        this.loadImages(this.Teeth[index], i);
                        this.tooth_ids_upper.push(i);
                    }
                    break;
                case 'lower':
                    // Add lower teeth initialization if needed
                    break;
            }
        } else if (this.canvas_id.toString() === "2" || this.canvas_id.toString() === "3") {
            switch (this.Arc) {
                case 'lower':
                    // Left side teeth (48 to 41)
                    for (let i = 48, index = 0; i >= 41; i--, index++) {
                        this.Teeth[index] = new Teeth(this.TeethController, i, m_CellWidth * index, 0);
                        this.loadImages(this.Teeth[index], i);
                        this.tooth_ids_lower.push(i);
                    }
                    
                    // Right side teeth (31 to 38)
                    for (let i = 31, index = 8; i <= 38; i++, index++) {
                        this.Teeth[index] = new Teeth(this.TeethController, i, m_CellWidth * index, 0);
                        this.loadImages(this.Teeth[index], i);
                        this.tooth_ids_lower.push(i);
                    }
                    
                    break;
            }
        }

        if (this.Canvas) {
            this.Canvas.addEventListener('click', this.clickDown.bind(this), false);
        }
    }

    loadImages(teeth, id) {
        const basePath = (this.canvas_id.toString() === '0' || this.canvas_id.toString() === '1') 
            ? "/assets/teethdown/" 
            : "/assets/teeth/";

        teeth.m_ImgFront.src = `${basePath}${id}.png`;
        teeth.m_ImgImplantFront.src = `/assets/implants${this.canvas_id.toString() === '0' || this.canvas_id.toString() === '1' ? 'down' : ''}/${id}.png`;
        teeth.m_ImgLing.src = `${basePath}${id}_L.png`;
        teeth.m_ImgFront.onload = this.checkLoadState.bind(this);
        teeth.m_ImgLing.onload = this.checkLoadState.bind(this);
    }

    clickDown(e) {
        if (!this.Canvas) return;
        
        const rect = this.Canvas.getBoundingClientRect();
        const num = Math.floor(((e.clientX - rect.left) / rect.width) * 16);
        if (this.Teeth[num]) {
            this.Teeth[num].m_Exists = !this.Teeth[num].m_Exists;
            this.Teeth[num].draw(this.Context, this.WireframeOnly);
        }
    }
    
    checkLoadState() {
        --this.leftToLoad;
        if (this.leftToLoad === 0) {
            this.drawBackground();
        }
    }
    
    drawBackground() {
        if (!this.Context) return;
        
        this.Context.fillStyle = "#353535";
        this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
        
        for (let i = 0; i < this.Teeth.length; i++) {
            if (this.Teeth[i]) {
                this.Teeth[i].draw(this.Context, this.WireframeOnly);
            }
        }
    }
}

