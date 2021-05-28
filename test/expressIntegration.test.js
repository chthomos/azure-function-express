import express from "express";
import { createAzureFunctionHandler } from "../src";

describe("express integration", () => {

  it("should work with x-powered-by", done => {

    // 1. Create express app
    const app = express();

    app.get("/api/:foo/:bar", (req, res) => {
      res.set("Cache-Control", "max-age=600");
      res.json({ foo: req.params.foo, bar: req.params.bar });
    });

    // 2. Create handle
    const handle = createAzureFunctionHandler(app);

    // 3. Mock Azure Function context
    var context = {
      bindings  : { req: { method: "GET", originalUrl: "https://lol.com/api/foo/bar" } },
      log       : () => { throw new Error("Log should not be called"); },
      done : (error) => {
        expect(error).toBeUndefined();
        expect(context.res.status).toBe(200);
        expect(context.res.body).toBe('{"foo":"foo","bar":"bar"}');
        expect(context.res.headers).toEqual({
          "x-powered-by"    : "Express",
          "cache-control"   : "max-age=600",
          "content-type"    : "application/json; charset=utf-8",
          "content-length"  : 25,
          etag              : 'W/"19-0CKEGOfZ5AYCM4LPaa4gzWL6olU"'
        });

        done();
      }
    };

    // 4. Call the handle with the mockup
    handle(context, context.req);
  });

  it("should work without x-powered-by", done => {

    // 1. Create express app
    const app = express();
    app.disable("x-powered-by");

    app.get("/api/:foo/:bar", (req, res) => {
      res.json({ foo: req.params.foo, bar: req.params.bar });
    });

    // 2. Create handle
    const handle = createAzureFunctionHandler(app);

    // 3. Mock Azure Function context
    var context = {
      bindings  : { req: { method: "GET", originalUrl: "https://lol.com/api/foo/bar" } },
      log       : () => { throw new Error("Log should not be called"); },
      done : (error) => {
        expect(error).toBeUndefined();
        expect(context.res.status).toBe(200);
        expect(context.res.body).toBe('{"foo":"foo","bar":"bar"}');
        expect(context.res.headers).toEqual({
          "content-type"    : "application/json; charset=utf-8",
          "content-length"  : 25,
          etag              : 'W/"19-0CKEGOfZ5AYCM4LPaa4gzWL6olU"'
        });

        done();
      }
    };

    // 4. Call the handle with the mockup
    handle(context, context.req);
  });

});
