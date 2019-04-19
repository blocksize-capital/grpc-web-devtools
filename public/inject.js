
window.__GRPCWEB_DEVTOOLS__ = function (clients) {
    if (clients.constructor !== Array) {
        return
    }
    clients.map(client => {
        client.client_.rpcCall_ = client.client_.rpcCall;
        client.client_.rpcCall2 = function (method, request, metadata, methodInfo, callback) {
            var posted = false;
            var newCallback = function (err, response) {
                if (!posted) {
                    window.postMessage({
                        type: "__GRPCWEB_DEVTOOLS__",
                        method,
                        request: request.toObject(),
                        response: err ? null : response.toObject(),
                        error: err,
                    }, "*")
                    posted = true;
                }
                callback(err, response)
            }
            return this.rpcCall_(method, request, metadata, methodInfo, newCallback);
        }
        client.client_.rpcCall = client.client_.rpcCall2;
        client.client_.unaryCall = function (method, request, metadata, methodInfo) {
            return new Promise((resolve, reject) => {
                this.rpcCall2(method, request, metadata, methodInfo, function (error, response) {
                    error ? reject(error) : resolve(response);
                });
            });
        };
    })
}