import { Change, Host } from '@schematics/angular/utility/change';
export class FullChange implements Change {
    order: number;
    description: string;
    constructor(public path: string, public length: number, public text: string) { }
    apply(host: Host): Promise<void> {
        host.write(this.path, this.text);
        return Promise.resolve();
    }
}
