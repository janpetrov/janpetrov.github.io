/**
 * Class used for assigning z-value to a new note or to a note currently clicked upon
 */
class ZAssigner {
    constructor(notesList, loadObj = null) {
        if (loadObj === null)
            this.lastZ = -1;
        else
            this.setState(loadObj);
        this.notesList = notesList;
    }

    getTopZ() {
        this.updateZ();
        return this.lastZ;
    }

    updateZ() {
        ++ this.lastZ;
        if (this.lastZ >= Constants.MAX_Z)
            this.reconstruct();
    }

    reconstruct() {
        let pairs = this.notesList.map(n => [n.getZ(), n]);
        pairs.sort((a,b) => a[0] - b[0]);
        pairs.forEach((pair,index) => pair[1].setZ(index));
        this.lastZ = this.notesList.length;
    }

    getState() {
        return this.lastZ;
    }

    setState(loadObj) {
        this.lastZ = loadObj;
    }
}
