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
        
        /**
         Istanziamo la WKWebView e settiamo alcuni attributi:
         - settiamo le dimensioni della web page come quelle del dispositivo
         - abilitiamo la navigazione tra le pagine tramite il touch screen
         */
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
        
        /**
         Caricamento pagina index.html (alternativa al caricamento da url)
         */
//        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
//            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
//        }
        
        /**
         Caricamento PWA nella WKWebView
         */
        let url = URL(string: "https://pwappocrate.herokuapp.com/pwa.html")!
        webView.load(URLRequest(url: url))
    }
    
    private lazy var webView: WKWebView = {
        let webView = WKWebView()
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.allowsBackForwardNavigationGestures = true
        return webView
    }()
    
    /**
     Funzione per inserire condice JavaScript nella pagina web
     In questo caso inseriamo uno script simile a quello commentato nel file
     index.html. Quando viene premuto il bottone 'Ricevi Notifiche' nella PWA
     viene mandato il seguente messaggio al codice nativo di Swift:
     "User asked for notifications"
     */
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
    
    /**
     Funzione analoga a quella sopra da usare per il file index.html
     */
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


/**
 Estensione del ViewController. Gestisce l'arrivo di messaggi dalla pagina web verso il codice nativo. In questo caso, si limita a stampare tali messaggi nella console di Xcode.
 */
extension ViewController: WKScriptMessageHandler {
    // we are assuming that the content received from the web page is a dictionary
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let dict = message.body as? [String: AnyObject] else {
            return
        }
        print(dict["message"]!)
        guard let message = dict["message"] else {
            return
        }
        
        // Usare il secondo script se si sta caricando il file index.html nella view
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

