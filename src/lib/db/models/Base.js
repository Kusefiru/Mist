
export class Base {
    constructor(data) {
        this.id = data.id;
    }

    // To reimplement: create class from OpenSubsonic API data
    static fromOpenSubsonic(data) {
        throw new Error("Not implemented.");
    }

    // To reimplement: return JSON structure of this class
    toJSON() {
        throw new Error("Not implemented.");
    }
}
