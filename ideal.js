/*jshint esversion:8*/

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const request = require("request");
const { TFRecordsBuilder, FeatureType } = require("@roboflow/tfrecords");
const async = require("async");

const file = fs.createWriteStream("streamed.tfrecord");
file.on("finish", function() {
    console.log("Done!");
});

const stream = TFRecordsBuilder.stream();
stream.pipe(file);

const source_image = "https://i.imgur.com/UGjjhB7.png";

request.get({
    url: source_image,
    encoding: null
}, function(error, response, body) {
    var times = 2000;
    async.timesLimit(times, 8, function(i, cb) {
        var callbackWhenWriteableStreamIsNotBacklogged = function() {
            if(file.writableLength > 10000) { // more than 10MB is queued to be written
                setTimeout(callbackIfWriteableStreamIsNotBacklogged, 1000);
                return;
            }

            if(i%100 == 0) console.log((i/times*100).toFixed(1)+"% finished.");
            cb(null);
        };

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

        stream.write(builder.build());
        callbackWhenWriteableStreamIsNotBacklogged();
    }, function() {
        console.log("All images sent");
        stream.end();
    });
});
