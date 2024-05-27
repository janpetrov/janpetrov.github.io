/**
 * This class represent a special note (there is exactly on of this type on the board)
 * with reset, save and info "buttons". User cannot delete the infonote and the infonote
 * has a special color (to visually differ from usual notes).
 */
class Infonote extends Note{

     /** The InfoNote constructor does not (unlike the Note constructor) accept
     * loadObj as its parameter. The reason is that only parameters relevant for the state of the
     * infoNote are its coordinates, which already are constructor parameters.
     * @param managers object with dragManager, colorAssigner, zAssigner, removeFunction,
     * storeFunction and saveFunction
     * @param leftVw Left vw position where the note is to be created on the board.
     * @param topVw Top vw position where the note is to be created on the board.
     */
    constructor(managers, leftVw, topVw) {
        super(managers, leftVw, topVw);
        this.saveFunction = managers.saveFunction;
    }

    /**
     * Overridden method inherited from note (infoNote has a different contents than note)
     */
    addTextArea() {

        // add the reset button (including its "safety switch")
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'check';
        checkbox.classList.add('noneinput');
        checkbox.checked = false;
        this.el.appendChild(checkbox);

        this.el.addEventListener('mouseleave', () => {
           checkbox.checked = false;
        });

        let label = document.createElement('label');
        label.classList.add('switch');
        label.innerText = 'reset';
        label.htmlFor = 'check';
        this.el.appendChild(label);

        let span = document.createElement('span');
        span.classList.add('slider');
        span.addEventListener('click', e => {
            if (checkbox.checked) {
                const audio = document.querySelector('audio');
                audio.play();
                this.removeFunction();
                this.storeFunction(true);
            }
        });
        this.el.appendChild(span);

        label.addEventListener('click', event => {
            event.stopPropagation();
        });

        // add the save button
        let save = document.createElement('a');
        save.classList.add('save');
        save.innerText = 'save';
        save.setAttribute('download', 'notes.txt');
        this.el.appendChild(save);

        save.addEventListener('click', () => {
            const all = this.saveFunction();
            const text = 'data:text/plain;charset=utf-8,' + encodeURIComponent(all);
            save.setAttribute('href', text);
        });

        // add drag and drop info
        let dragInfo = document.createElement('div');
        dragInfo.classList.add('draginfo');
        dragInfo.innerText = 'load: drag&drop';
        this.el.appendChild(dragInfo);

        // add drag and drop info
        let infoFile = document.createElement('a');
        infoFile.classList.add('save');
        infoFile.style.width = '9.5vw';
        infoFile.innerText = 'user guide';
        infoFile.setAttribute('download', 'readme.txt');
        infoFile.setAttribute('href', 'readme.txt');
        this.el.appendChild(infoFile);
    }

    /**
     * The addClosingSVG method inherited from Note is overridden here as an empty method.
     * This makes the infonote impossible to close.
     */
    addClosingSVG() {
    }
}
