import UIKit
import WebKit

// Casca do jogo: abre o Olienzinho (HTML + JS guardado dentro do aplicativo) em tela cheia, sem barra do navegador.
class GameViewController: UIViewController {
    private var web: WKWebView!

    override var prefersStatusBarHidden: Bool { return true }
    override var prefersHomeIndicatorAutoHidden: Bool { return true }
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { return .all }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { return .landscape }
    override var shouldAutorotate: Bool { return true }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 5 / 255, green: 1 / 255, blue: 15 / 255, alpha: 1)

        let cfg = WKWebViewConfiguration()
        cfg.allowsInlineMediaPlayback = true
        cfg.mediaTypesRequiringUserActionForPlayback = []
        cfg.applicationNameForUserAgent = "OlienzinhoApp"
        cfg.setValue(true, forKey: "allowUniversalAccessFromFileURLs")

        web = WKWebView(frame: .zero, configuration: cfg)
        web.translatesAutoresizingMaskIntoConstraints = false
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 5 / 255, green: 1 / 255, blue: 15 / 255, alpha: 1)
        web.scrollView.backgroundColor = web.backgroundColor
        web.scrollView.isScrollEnabled = false
        web.scrollView.bounces = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        view.addSubview(web)
        NSLayoutConstraint.activate([
            web.topAnchor.constraint(equalTo: view.topAnchor),
            web.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            web.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            web.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        if let dir = Bundle.main.url(forResource: "web", withExtension: nil) {
            var c = URLComponents(url: dir.appendingPathComponent("index.html"), resolvingAgainstBaseURL: false)!
            c.query = "bundle=1&nosw=1"
            web.loadFileURL(c.url!, allowingReadAccessTo: dir)
        }

        NotificationCenter.default.addObserver(self, selector: #selector(pauseGame), name: UIApplication.willResignActiveNotification, object: nil)
    }

    // ao sair do aplicativo durante a partida, o jogo pausa
    @objc private func pauseGame() {
        web.evaluateJavaScript("try{if(G.state==='play'){window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));}}catch(e){}", completionHandler: nil)
    }
}
