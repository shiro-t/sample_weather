#!/usr/bin/env node


class AreaCodes {
    constructor() {
        this.area_data = {} ;
        this.area_list = {} ;
    }

    async retrieve() {
        const response = await fetch( "https://www.jma.go.jp/bosai/common/const/area.json" );
        if( !response.ok ) {
            throw new Error("failed to get weather data from the site. code ${response.status}")
        }
        this.area_data = await response.json() ;
        return
    }
    
    async get_areacode( areaname ) {
        let k;

        if( Object.keys( this.area_data ).length <= 0 ) {
             await this.retrieve();
        } 

        for( k in this.area_data.offices ) {
            if( this.area_data.offices[k].enName.toLowerCase().startsWith( areaname.toLowerCase() ) ) {
                return k;
            }
        }
        throw new Error("no office area");
    }

//    get_fistarea( areacode ) {
//        if( this.area.data.offices[areacode] ) {
//            return this.area_data.offices[areacode].children[0] ;
//        }else{
//            return "";
//        }
//    }

    async get_arealist() {
        if( Object.keys( this.area_list.length <= 0 ) ) {
   
            if( Object.keys( this.area_data ).length <= 0 ) {
                 await this.retrieve();
            }
 
            let k;
            for( k in this.area_data.offices ) {
                 this.area_list[ this.area_data.offices[k].name ] = k ;
            }
        }
        return this.area_list;
    }
}

async function get_weather_data( areacode ) {
    const response = await fetch( "https://www.jma.go.jp/bosai/forecast/data/forecast/" + areacode + ".json" );
    if( !response.ok ) {
        throw new Error("failed to get weather data from the site. code ${response.status}")
    }

    const weather_data = await response.json() ;

    let retdict = {} ;
    return [ weather_data[0].timeSeries[0].areas[0].weathers[0] ,
             weather_data[0].timeSeries[0].areas[0].weatherCodes[0] ];

    return retdict
}

async function main() {

    let areaname = "tokyo";
    if( process.argv.length > 2 ) {
        // argv[0] == "node"
        // argv[1] == "tenki.js"
        areaname = process.argv[2]
    }else{
        areaname = "tokyo";
    }

    let areacodes = new AreaCodes();
    aret = await areacodes.get_areacode( areaname );
    console.log( aret );

    const wrets = await get_weather_data( aret );
    console.log( wrets[0] ) ;
    console.log( wrets[1] );

    const wlist = await areacodes.get_arealist();
    console.log( wlist );


}
main()
