/*jshint esversion:8*/

import fs from "fs";
import path from "path";
import { default as _ } from "lodash";
import request from "request";
import { TFRecordsBuilder, FeatureType } from "@roboflow/tfrecords";
import { Readable } from "stream";

const source_image = "https://i.imgur.com/UGjjhB7.png";

request.get(
  {
    url: source_image,
    encoding: null,
  },
  function(error, response, body) {
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
      builder.addArrayFeature("image/object/class/text", FeatureType.String, [
        "image",
      ]);
      builder.addArrayFeature("image/object/class/label", FeatureType.Int64, [
        0,
      ]);

      records.push(builder.build());

      if (i % 100 == 0)
        console.log(((i / times) * 100).toFixed(1) + "% finished.");
    });

    const readable = TFRecordsBuilder.buildTFRecordsAsStream(records);
    readable.pipe(fs.createWriteStream(path.join(__dirname, "big.tfrecord")));
  },
);
