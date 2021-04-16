//
//  ViewController.swift
//  WKWebViewTest
//
//  Created by Andrea Borghesi on 15/04/21.
//
// https://diamantidis.github.io/2020/02/02/two-way-communication-between-ios-wkwebview-and-web-page

import UIKit
import WebKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.addSubview(webView)
        // set web view layout constraints
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.layoutMarginsGuide.bottomAnchor),
            webView.topAnchor.constraint(equalTo: view.layoutMarginsGuide.topAnchor)
        ])
        // make our WKWebView aware of the message handler
        // A WKUserContentController object provides a way for JavaScript to post messages to a web view.
        let contentController = self.webView.configuration.userContentController
        contentController.add(self, name: "toggleMessageHandler")
        // Inject JavaScript
        injectJS(to: contentController)
        
//        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
//            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
//        }
        
        let url = URL(string: "https://pwappocrate.herokuapp.com/pwa.html")!
        webView.load(URLRequest(url: url))
    }
    
    private lazy var webView: WKWebView = {
        let webView = WKWebView()
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.allowsBackForwardNavigationGestures = true
        return webView
    }()
    
    private func injectJS(to contentController: AnyObject) {
        let js = """
            const notifyBtn = document.querySelector('#showNotificationBtn');
            notifyBtn.style.display = "block";
            notifyBtn.addEventListener('click', () => {
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
                    window.webkit.messageHandlers.toggleMessageHandler
                        .postMessage({
                            "message": "User asked for notifications"
                        });
                }
            });
        """
        let script = WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        contentController.addUserScript(script)
    }
    
//    private func injectJS(to contentController: AnyObject) {
//        let js = """
//            var _selector = document.querySelector('input[name=myCheckbox]');
//            _selector.addEventListener('change', function(event) {
//                var message = (_selector.checked) ? "Toggle Switch is on" : "Toggle Switch is off";
//                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
//                    window.webkit.messageHandlers.toggleMessageHandler.postMessage({
//                        "message": message
//                    });
//                }
//            });
//        """
//        let script = WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
//        contentController.addUserScript(script)
//    }


}

extension ViewController: WKScriptMessageHandler {
    // we are assuming that the content received from the web page is a dictionary
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let dict = message.body as? [String: AnyObject] else {
            return
        }
        print(dict["message"])
        guard let message = dict["message"] else {
            return
        }
        
        let script = "document.getElementById('showNotificationBtn').style.display = 'none'"
        //let script = "document.getElementById('value').innerText = \"\(message)\""
        // execute js code on the web page
        webView.evaluateJavaScript(script) { (result, error) in
            if let result = result {
                //print("Label is updated with message: \(result)")
            } else if let error = error {
                print("An error occurred: \(error)")
            }
        }
    }
}

