export const KISII_COUNTY_DATA = {
    county: "Kisii County",
    constituencies: [
        {
            name: "Bonchari",
            wards: ["Bomariba", "Bogiakumu", "Bokeira", "Riana"]
        },
        {
            name: "South Mugirango",
            wards: ["Bogetenga", "Borabu / Chitago", "Moticho", "Getenga", "Tabaka", "Boikanga"]
        },
        {
            name: "Bomachoge Borabu",
            wards: ["Borabu Masaba", "Boochi Borabu", "Bokimonge", "Magenche"]
        },
        {
            name: "Bobasi",
            wards: ["Masige West", "Masige East", "Basi Central", "Nyacheki", "Bassi Bogetaorio", "Bobasi Chache", "Sameta / Mokwerero", "Bobasi / Boitangare"]
        },
        {
            name: "Nyaribari Masaba",
            wards: ["Ichuni", "Nyamasibi", "Masimba", "Gesusu", "Kiamokama"]
        },
        {
            name: "Bomachoge Chache",
            wards: ["Majoge Basi", "Boochi / Tendere", "Bosoti / Sengera"]
        },
        {
            name: "Nyaribari Chache",
            wards: ["Kisii Central", "Bobaracho", "Keumbu", "Kiogoro", "Ibeno", "Birongo"]
        },
        {
            name: "Kitutu Chache North",
            wards: ["Monyerero", "Sensi", "Marani", "Mwamonari"]
        },
        {
            name: "Kitutu Chache South",
            wards: ["Bogusero", "Bogeka", "Nyakoe", "Kitutu Central", "Nyatieko"]
        }
    ]
};

export type Constituency = typeof KISII_COUNTY_DATA.constituencies[number];
