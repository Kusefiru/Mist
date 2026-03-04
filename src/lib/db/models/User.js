import { Base } from './Base';

export class User extends Base {
    constructor(data) {
        super(data);
        //
        this.canDownload = data.canDownload;
    }

    // Create class from API data
    static fromOpenSubsonic(data) {
        return new User({
            id: data.username,
            // Permissions
            canDownload: data.downloadRole
        });
    }
}
