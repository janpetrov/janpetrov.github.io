/**
 * This class gets mouse cursor position over the board and moves a note (if it is being
 * currently dragged) accordingly.
 *
 * The dragged note must register itself using the register method
 */
class DragManager {
    constructor(storeFunction) {
        this.el = document.querySelector(Constants.NOTES_WRAPPER);
        this.draggedNote = null;
        this.dragged = false;
        this.dragEnded = false;
        this.storeFunction = storeFunction;

        this.el.addEventListener('mousemove', event => {
            let dn = this.draggedNote;
            if (event.buttons === 1)
                this.dragged = true;
            if (dn != null) {
                let [mouseXVw, mouseYVw] = Units.pageVwFromClientXY(event.clientX, event.clientY);
                dn.setPositionVwMinusOffset(mouseXVw, mouseYVw);
            }
        });

        window.addEventListener('mouseup', event => {
            if (this.dragged) {
                this.dragEnded = true;
                this.storeFunction(true);
            }
            this.dragged = false;
            if (this.draggedNote !== null)
                this.deregister(this.draggedNote);
        });

    }

    register(note) {
        this.draggedNote = note;
        this.dragged = false;
    }

    deregister(note) {
        if (note === this.draggedNote) {
            this.dragged = false;
            this.draggedNote = null;
            this.dragEnded = true;
        }
    }
}
