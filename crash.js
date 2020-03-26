/*jshint esversion:8*/

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const request = require("request");
const { TFRecordsBuilder, FeatureType } = require("@roboflow/tfrecords");

const source_image = "https://i.imgur.com/UGjjhB7.png";

request.get({
    url: source_image,
    encoding: null
}, function(error, response, body) {
    var records = [];

    var times = 2000;
    _.times(times, function(i) {
        const builder = new TFRecordsBuilder();

        builder.addFeature("image/width", FeatureType.Int64, 702);
        builder.addFeature("image/height", FeatureType.Int64, 936);
        builder.addFeature("image/filename", FeatureType.String, "image.png");
        builder.addFeature("image/encoded", FeatureType.Binary, body);
        builder.addFeature("image/format", FeatureType.String, "png");
        builder.addArrayFeature("image/object/bbox/xmin", FeatureType.Float, [0]);
        builder.addArrayFeature("image/object/bbox/ymin", FeatureType.Float, [0]);
        builder.addArrayFeature("image/object/bbox/xmax", FeatureType.Float, [1]);
        builder.addArrayFeature("image/object/bbox/ymax", FeatureType.Float, [1]);
        builder.addArrayFeature("image/object/class/text", FeatureType.String, ["image"]);
        builder.addArrayFeature("image/object/class/label", FeatureType.Int64, [0]);

        records.push(builder.build());

        if(i%100 == 0) console.log((i/times*100).toFixed(1)+"% finished.");
    });

    const built = TFRecordsBuilder.buildTFRecords(records);
    fs.writeFileSync(path.join(__dirname, "big.tfrecord"), built);
});
