#!/usr/bin/env python

import sys,json
import requests

AREA_URL="https://www.jma.go.jp/bosai/common/const/area.json"
WEATHER_URL="https://www.jma.go.jp/bosai/forecast/data/forecast/%s.json"
ICON_URL="https://www.jma.go.jp/bosai/forecast/img/%s.svg"

wmap = { "100":"500", "101":"501", "102":"502", "103":"502", "104":"504",
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
         "450":"400" }

def main():
    areaname = "tokyo"
    areacode = ""
    childcode = ""

    if len( sys.argv ) > 1 :
        if sys.argv[1].isdecimal() :
            areaname = ""
            areacode = sys.argv[1]
        else:
            areaname = sys.argv[1]
            areacode = ""

    if len( areaname ) > 0 :
        response = requests.get( AREA_URL )
        if response.status_code != 200 :
            print("failed to get area data from the site. code %d" % response.status_code,  file=sys.stderr )
            exit(1)
        area_data = json.loads(response.text)
        ## search office (prefectures)
        if not "offices" in area_data.keys() :
            print("no office area.",  file=sys.stderr )
            exit(1)

        for k in area_data["offices"].keys() :
            if not "enName" in area_data["offices"][k] :
                skip

            if area_data["offices"][k]["enName"].lower().startswith( areaname.lower() ):
                areacode = k
                childcode = area_data["offices"][k]["children"][0]
                break 

        if len( areacode ) < 1: 
            print("no office area 2.",  file=sys.stderr )
            exit(1)

        response = requests.get( WEATHER_URL % areacode )
        if response.status_code != 200 :
            print("failed to get weather data from the site. code %d" % response.status_code,  file=sys.stderr )
            exit(1)
 
        weather_data = json.loads(response.text)
        ### print( weather_data[0]["timeSeries"][0] )
        if not "areas" in weather_data[0]["timeSeries"][0] :
            print("no area area in %s ( %s )." % ( areaname, areacode ),  file=sys.stderr )
            exit(1)
        ### print( weather_data[0]["timeSeries"][0]["areas"] )
        for d in weather_data[0]["timeSeries"][0]["areas"] :
            print( "%s ( %s )" % ( d["area"]["name"], d["area"]["code"]) )
            print( "    %s" % d["weathers"][0] )
            if d["weatherCodes"][0] in wmap :
                ## print("mapped %s -> %s" % ( d["weatherCodes"][0] ,  wmap[ d["weatherCodes"][0] ] ) )
                print( "    " + ICON_URL % wmap[ d["weatherCodes"][0] ] )
            else:
                print( "    " + ICON_URL % d["weatherCodes"][0] )
        print("")
    else:
        print("no area data." , file=sys.stderr )


if __name__ == '__main__' :
    main()
