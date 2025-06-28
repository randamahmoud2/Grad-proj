import {ChartRenderer} from "./ChartRenderer";
export class Charting {
    constructor(TeethController, canvas_id) {
      this.Maxilla = new ChartRenderer('upper', this, TeethController, canvas_id);
      this.Mandibula = new ChartRenderer('lower', this, TeethController, canvas_id);

      this.tooth_ids_upper = this.Maxilla.tooth_ids_upper1;
      this.tooth_ids_lower = this.Mandibula.tooth_ids_lower1;

      this.CurrentTeeth = {major:0, minor:0, face:0, asObject:-1, gingival:0};
      this.CurrentField = null;
      this.HEIGHT_STEP = 5; // px Y step offset
      this.GMColor = 'green';
      this.PDColor = 'red';
      this.TeethController = TeethController;
    }
    
    initialise() {
      this.Mandibula.initialise();
      this.Maxilla.initialise();
    }
    
    getTeethOnRight(id) {
      
      if (id > 30) {
        for (let i = 0; i < 15; i++)
          if (this.Mandibula.Teeth[i]?.Id === id)
            return this.Mandibula.Teeth[i + 1];
      } else {
        for (let i = 0; i < 15; i++)
          if (this.Maxilla.Teeth[i]?.Id === id)
            return this.Maxilla.Teeth[i + 1];
      }
      return null;

    }
  
    getTeethOnLeft(id) {



      if (id > 30) {
        for (let i = 1; i <= 15; i++)
          if (this.Mandibula.Teeth[i]?.Id === id)
            return this.Mandibula.Teeth[i - 1];
      } else {
        for (let i = 1; i <= 15; i++)
          if (this.Maxilla.Teeth[i]?.Id === id)
            return this.Maxilla.Teeth[i - 1];
      }
      return null;

    }

    getTeethById(id) {

      
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (this.Maxilla?.Teeth) {
          const maxillaTooth = this.Maxilla.Teeth.find(t => t?.Id === numId);
          if (maxillaTooth) return maxillaTooth;
      }
      
      if (this.Mandibula?.Teeth) {
          const mandibulaTooth = this.Mandibula.Teeth.find(t => t?.Id === numId);
          if (mandibulaTooth) return mandibulaTooth;
      }
      
      return null;
    }

    drawTooth(id = -1) {
      if (id === -1) {
        if(this.CurrentTeeth.asObject.Id > 30)
          this.CurrentTeeth.asObject.draw(this.Mandibula.Context, this.Mandibula.WireframeOnly, this);
        else this.CurrentTeeth.asObject.draw(this.Maxilla.Context, this.Mandibula.WireframeOnly, this);
        return;
      }
      const t = this.getTeethById(id);
      if (!t) return;
      
      if (t.Id > 30)
        t.draw(this.Mandibula.Context, this.Mandibula.WireframeOnly, this);
      else t.draw(this.Maxilla.Context, this.Mandibula.WireframeOnly, this);
    }
    
    cycle_furcState(tooth) {
      try {
        const e = document.getElementById('furca' + tooth);
        if (!e) return;
        
        let fillRate;
        
        if(e.classList.contains("half_fill")) {
          e.className = "box fill";
          fillRate = 1;
        } else if (e.classList.contains("fill")) {
          e.className = "box";
          fillRate = 0.0;
        } else {
          e.className = "box half_fill";
          fillRate = 0.5;
        }
        
        const face = tooth.charAt(1);
        let toothId;
        if (face !== 'm' && face !== 'd') {
          toothId = tooth.substr(1);
        } else toothId = tooth.substr(2);
    
        const toothObj = this.getTeethById(toothId);
        if (!toothObj) return;
    
        if (face === 'm') {
          toothObj.m_Furcation.m = fillRate;
        } else if (face === 'd') {
          toothObj.m_Furcation.d = fillRate;
        } else {
          toothObj.m_Furcation.c = fillRate;
        }
        this.drawTooth(toothId);
      } catch (e) {
        console.error(e);
      }
    }
}
