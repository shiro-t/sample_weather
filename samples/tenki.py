#!/usr/bin/env python

import sys,json
import requests

AREA_URL="https://www.jma.go.jp/bosai/common/const/area.json"
WEATHER_URL="https://www.jma.go.jp/bosai/forecast/data/forecast/%s.json"
ICON_URL="https://www.jma.go.jp/bosai/forecast/img/%s.svg"


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

            if area_data["offices"][k]["enName"].lower().startswith( areaname ):
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

        d = weather_data[0]["timeSeries"][0]["areas"][0]
        print( "%s ( %s )" % ( d["area"]["name"], areacode ) )
        print( "    %s" % d["weathers"][0] )
        print( "    " + ICON_URL % d["weatherCodes"][0] )

    else:
        print("no area data." , file=sys.stderr )


if __name__ == '__main__' :
    main()
