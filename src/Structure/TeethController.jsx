import { Charting } from './Charting';
export class TeethController {
    constructor(canvas_id) {
        this.canvas_id = canvas_id;
        this.Charting = new Charting(this, canvas_id);
    }
  

    initialise() {
        this.Charting.initialise();
        // const refreshBtn = document.getElementById('refresh_bt');
        // if (refreshBtn) {
        //     refreshBtn.addEventListener("click", () => {
        //         this.Charting.Maxilla.drawBackground();
        //         this.Charting.Mandibula.drawBackground();
        //     }, false);
        // }
    }

    getTeethById(id) {
        return this.Charting.getTeethById(id);
    }

    drawTooth(id) {
        this.Charting.drawTooth(id);
    }

    cycle_furcState(tooth) {
        this.Charting.cycle_furcState(tooth);
    }
}
