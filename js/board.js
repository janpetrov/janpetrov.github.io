/**
 * The 'main' class. It creates and maintains all notes and includes methods (saveAll, loadAll,
 * storeAll, restoreAll) for saving and loading the complete state of the application to and from
 * a file and for storing the application state to, and restoring it from, the WebStorage
 */
class Board {
    constructor() {
        this.notes = [];
        this.lastState = 0;

        window.addEventListener('popstate', event => {
            this.lastState = event.state.page;
            this.loadAll(event.state.state);
            this.storeAll();
        });

        // methods exported to the Note class
        this.managers = {
            dragManager: new DragManager(this.storeAll.bind(this)),
            colorAssigner: new ColorAssigner(),
            zAssigner: new ZAssigner(this.notes),
            removeFunction: this.removeOneNote.bind(this),
            storeFunction: this.storeAll.bind(this),
        };

        // methods exported to the Infonote class
        // please note that notes and infonote differ in colorAssigner and removeFunction
        // infoManager includes saveFunction in addition
        this.infoManager = {
            dragManager: this.managers.dragManager,
            colorAssigner: new ColorInfoAssigner(),
            zAssigner: this.managers.zAssigner,
            removeFunction: this.removeAllNotes.bind(this),
            saveFunction: this.saveAll.bind(this),
            storeFunction: this.storeAll.bind(this)
        };

        this.infoNote =
            new Infonote(this.infoManager, Constants.INFO_LEFT_VW, Constants.INFO_TOP_VW);

        this.el = document.querySelector(Constants.NOTES_WRAPPER);
        document.addEventListener('dragenter', event => {
            this.el.classList.add('maindrag');
            event.stopPropagation();
            event.preventDefault();
        });
        document.addEventListener('dragleave', event => {
            this.el.classList.remove('maindrag');
        });
        document.addEventListener('dragover', event  => {
            event.stopPropagation();
            event.preventDefault();
        });
        document.addEventListener('drop', event => {
            this.el.classList.remove('maindrag');
            event.stopPropagation();
            event.preventDefault();

            const files = event.dataTransfer.files;
            if (files.length < 1)
                alert('Only files can be dropped here');
            else if (files.length > 1)
                alert('Exactly 1 file (and not a batch of 2 or more) needs to be dropped here');
            else {
                const file = files[0];
                const fr = new FileReader();
                fr.onload = e => {
                    this.loadAll(e.target.result);
                    this.storeAll(true);
                };
                fr.readAsText(file);
            }
        });

        this.el.addEventListener('click', event => {
            let dragManager = this.managers.dragManager;
            if (!dragManager.dragged && !dragManager.dragEnded) {
                this.storeAll(true);
                const [leftVw, topVw] = Units.pageVwFromClientXY(event.clientX, event.clientY);
                let newNote = new Note(this.managers, leftVw, topVw);
                this.notes.push(newNote);
                this.storeAll(true);
            }
            dragManager.dragEnded = false;
        });

        this.restoreAll();
        this.storeAll(true);
    }

    removeOneNote(note) {
        this.notes = this.notes.filter(i => i !== note);
        note.removeSelfFromDOM();
    }

    removeAllNotes() {
        this.notes.forEach(n => n.removeSelfFromDOM());
        this.notes = [];
    }


    /**
     * Save the application state to WebStorage and optionally to history
     * @param withHistory true if the state should be saved also to history, false otherwise
     * @param replaceState true if the last history state should be replace (instead of it
     * being added to). Relevant only if withHistory==true.
     */
    storeAll(withHistory = false, replaceState = false) {
        const state = this.saveAll();
        window.localStorage.setItem('state', state);
        if (withHistory && replaceState) {
            window.history.replaceState({page: this.lastState-1, state: state},
                "Notes Application", `?h=${this.lastState}`);
        }
        if (withHistory && !replaceState) {
            window.history.pushState({page: this.lastState, state: state},
                "Notes Application", `?h=${this.lastState}`);
            ++ this.lastState;
        }
    }

    /**
     * Retrieve application state from WebStorage (if it is stored there)
     */
    restoreAll() {
        const all = window.localStorage.getItem('state');
        if (all !== null)
            this.loadAll(all);
    }

    /**
     * returns the whole application state as a string
     * used for storing application state into a file or WebStorage
     */
    saveAll() {
        let all = {
            nextColor: this.managers.colorAssigner.getState(),
            lastZ: this.managers.zAssigner.getState(),
            infoNotePosition: this.infoNote.getPosition(),
            notes: this.notes.map(n => n.getState())
        };

        const mainText = JSON.stringify(all);
        const hash = this.hashCode(mainText);
        const lead = 'NOTESAPP1.0-';

        return lead + hash + mainText;
    }

    hashCode(s) {
        let h = 0, l = s.length, i = 0;
        if ( l > 0 )
            while (i < l)
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
        h = h.toFixed(0).substr(0, Constants.HASH_LENGTH);
        if (h.length < Constants.HASH_LENGTH)
            h += '-'.repeat(20 - h.length);
        return h;
    }

    /**
     * Checks whether the input string is valid, and if so, returns application state object
     * @param str string that should have been created by this application
     * @returns false if the input string is not in the correct format, otherwise the object
     * representing the appication state
     */
    parseLoadString(str) {
        const leadShould = 'NOTESAPP1.0-';
        const leadIs = str.substr(0, leadShould.length);
        if (leadShould !== leadIs || str.length < leadShould.length + Constants.HASH_LENGTH) {
            alert('The file does not seem to be in the NOTES APP format');
            return false;
        }
        const isHash = str.substr(leadShould.length, Constants.HASH_LENGTH);
        const mainText = str.substr(leadShould.length + Constants.HASH_LENGTH);
        const shouldHash = this.hashCode(mainText);
        if (isHash !== shouldHash) {
            alert('The file seems to be corrupted (hash code checksum failed)');
            return false;
        }
        return JSON.parse(mainText);
    }

    /**
     * Sets the state of the application from the input string
     * @param str unchecked input string (loadAll itself calls parseLoadString)
     */
    loadAll(str) {
        const all = this.parseLoadString(str);
        if (all !== false) {
            this.removeAllNotes();
            this.managers.colorAssigner.setState(all.nextColor);
            this.managers.zAssigner.setState(all.lastZ);
            this.infoNote.resetOffset();
            const [left, top] = all.infoNotePosition;
            this.infoNote.setPositionVwMinusOffset(left, top);
            all.notes.sort((a,b) => a.zIndex - b.zIndex);
            all.notes.map(noteData => {
                let newNote = new Note(this.managers, null, null, noteData);
                this.notes.push(newNote);
            });
        }
    }
}
