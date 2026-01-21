#! /usr/bin/env ruby

require 'http'
require 'json'

AREA_URL="https://www.jma.go.jp/bosai/common/const/area.json"
WEATHER_URL="https://www.jma.go.jp/bosai/forecast/data/forecast/%s.json"
ICON_URL="https://www.jma.go.jp/bosai/forecast/img/%s.svg"

WMAP = { "100" => "500", "101" => "501", "102" => "502", "103" => "502", "104" => "504",
         "105" => "504", "106" => "502", "107" => "502", "108" => "502", "110" => "510",
         "111" => "510", "112" => "512", "113" => "512", "114" => "512", "115" => "515",
         "116" => "515", "117" => "515", "118" => "512", "119" => "512", "120" => "502",
         "121" => "502", "122" => "512", "123" => "500", "124" => "500", "125" => "512",
         "126" => "512", "127" => "512", "128" => "512", "130" => "500", "131" => "500",
         "132" => "501", "140" => "502", "160" => "504", "170" => "504", "181" => "515",
         "201" => "601", "203" => "202", "205" => "204", "206" => "202", "207" => "202",
         "208" => "202", "209" => "200", "210" => "610", "211" => "610", "213" => "212",
         "214" => "212", "216" => "215", "217" => "215", "218" => "212", "219" => "212",
         "220" => "202", "221" => "202", "222" => "212", "223" => "601", "224" => "212",
         "225" => "212", "226" => "212", "228" => "215", "229" => "215", "230" => "215",
         "231" => "200", "240" => "202", "250" => "204", "260" => "204", "270" => "204",
         "281" => "215", "301" => "701", "304" => "300", "306" => "300", "309" => "303",
         "311" => "711", "315" => "314", "316" => "711", "317" => "313", "320" => "711",
         "321" => "313", "322" => "303", "323" => "711", "324" => "711", "325" => "711",
         "326" => "314", "327" => "314", "328" => "300", "329" => "300", "340" => "400",
         "350" => "300", "361" => "811", "371" => "413", "401" => "801", "405" => "400",
         "407" => "406", "409" => "403", "411" => "811", "420" => "811", "421" => "413",
         "422" => "414", "423" => "414", "425" => "400", "426" => "400", "427" => "400",
         "450" => "400" }

def main() 
    areacode = ""
    areaname = "tokyo"

    if ARGV.length > 0 then
        if ARGV[0].match(/[0-9]+/) then
            areacode = ARGV[0]
            areaname = ""
        else
            areaname  = ARGV[0]
        end
    end

    if areaname.length > 0 then 
        response = HTTP.get( AREA_URL )
        ## puts response
    
        area_data = JSON.load( response );
    
        if not area_data.has_key? "offices" then
            $stderr.puts "no office area"
            exit(1)
        end
    
        area_data["offices"].each{ | k, v |
            if not v.has_key? "enName" then
                next
            end
    
            if v["enName"].downcase().start_with?( areaname.downcase() ) then
                areacode = k
                break;
            end
        }
    
        if areacode.length < 1 then
            $stderr.puts "no office area 2"
            exit(1)
        end
    
        response = HTTP.get( WEATHER_URL % areacode )
        weather_data = JSON.load( response ) 
    
        ##puts weather_data
        if not weather_data[0]["timeSeries"][0].has_key? "areas" then
            $stderr.puts "no area in %s ( %s )" % [ areaname, areacode ]
            exit(1)
        end
    
        weather_data[0]["timeSeries"][0]["areas"].each{ |d| 
            puts "%s ( %s )" % [ d["area"]["name"], d["area"]["code"] ]
            puts "    %s "   %   d["weathers"][0] 
            if WMAP.has_key? d["weatherCodes"][0] then
                puts "    " + ICON_URL % WMAP[ d["weatherCodes"][0] ] 
            else
               puts "    " + ICON_URL % d["weatherCodes"][0] 
            end
        }
        puts "" 
    else
        $stedrr.puts "no area data"
    end
end

if __FILE__ == $0
   main()
end

