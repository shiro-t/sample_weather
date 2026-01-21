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

    let retarray = [] ;

    for( d in weather_data[0].timeSeries[0].areas ) {
        // console.log(  weather_data[0].timeSeries[0].areas[d] );

        retarray.push( { "name" :       weather_data[0].timeSeries[0].areas[d].area.name , 
                         "weather" :    weather_data[0].timeSeries[0].areas[d].weathers[0],
                         "weatherCode" : weather_data[0].timeSeries[0].areas[d].weatherCodes[0] } );
    }

    return retarray;
}


// mapping from weather codes to real svg numbers.
const wmap = { "100":"500", "101":"501", "102":"502", "103":"502", "104":"504",
               "105":"504", "106":"502", "107":"502", "108":"502", "110":"510",
               "111":"510", "112":"512", "113":"512", "114":"512", "115":"515",
               "116":"515", "117":"515", "118":"512", "119":"512", "120":"502",
               "121":"502", "122":"512", "123":"500", "124":"500", "125":"512",
               "126":"512", "127":"512", "128":"512", "130":"500", "131":"500",
               "132":"501", "140":"502", "160":"504", "170":"504", "181":"515",
               "201":"601", "203":"202", "205":"204", "206":"202", "207":"202",
               "208":"202", "209":"200", "210":"610", "211":"610", "213":"212",
               "214":"212", "216":"215", "217":"215", "218":"212", "219":"212",
               "220":"202", "221":"202", "222":"212", "223":"601", "224":"212",
               "225":"212", "226":"212", "228":"215", "229":"215", "230":"215",
               "231":"200", "240":"202", "250":"204", "260":"204", "270":"204",
               "281":"215", "301":"701", "304":"300", "306":"300", "309":"303",
               "311":"711", "315":"314", "316":"711", "317":"313", "320":"711",
               "321":"313", "322":"303", "323":"711", "324":"711", "325":"711",
               "326":"314", "327":"314", "328":"300", "329":"300", "340":"400",
               "350":"300", "361":"811", "371":"413", "401":"801", "405":"400",
               "407":"406", "409":"403", "411":"811", "420":"811", "421":"413",
               "422":"414", "423":"414", "425":"400", "426":"400", "427":"400",
               "450":"400" };


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
    // console.log( aret );

    const wrets = await get_weather_data( aret );

    for( w in wrets ) {
        console.log( wrets[w].name ) ;
        console.log( wrets[w].weather );
        if( wmap[ wrets[w].weatherCode ] ) {
            // console.log( "mapped " + wrets[w].weatherCode + " -> " + wmap[ wrets[w].weatherCode ] );

            console.log( "https://www.jma.go.jp/bosai/forecast/img/" + wmap[ wrets[w].weatherCode ] + ".svg" );
        }else{
            console.log( "https://www.jma.go.jp/bosai/forecast/img/" + wrets[w].weatherCode  + ".svg" );
        }
    }
    console.log("")
    // const wlist = await areacodes.get_arealist();
    // console.log( wlist );


}
main()
