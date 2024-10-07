export default interface AudioServiceInterface {
    download(url: string): Promise<string>;
    //download2(url: string): Promise<string>;
    
}