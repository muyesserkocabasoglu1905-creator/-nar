# Tic Tac Toe Oyununu Yayınlama ve Paylaşma Rehberi

Bu rehber, oluşturduğunuz bu harika Tic Tac Toe oyununu internette nasıl yayınlayacağınızı, herkesle paylaşabileceğiniz bir link alacağınızı ve kodunuzu GitHub'a nasıl yükleyeceğinizi adım adım anlatır.

---

## A. Oyunu Yayınlayıp Link Alma (Netlify ile)

En kolay ve ücretsiz yöntem olan **Netlify**'ı kullanacağız.

### Gereksinimler

Bu adımları uygulamak için projenizin dosyalarının bilgisayarınızda olması ve terminal (komut satırı) kullanabiliyor olmanız gerekir.

### Adım 1: Projenizi "Derleyin" (Build)

Kodunuzun yayınlanmaya hazır, optimize edilmiş bir versiyonunu oluşturmamız gerekiyor.

1.  Projenizin ana klasöründe bir terminal açın.
2.  Önce gerekli paketleri kurmak için şu komutu çalıştırın:
    ```bash
    npm install
    ```
3.  Paketler yüklendikten sonra, projenizi derlemek için şu komutu çalıştırın:
    ```bash
    npm run build
    ```

Bu komut bittiğinde, projenizin içinde `build` (veya `dist`) adında yeni bir klasör oluştuğunu göreceksiniz. Yayınlayacağımız dosyalar işte bu klasörün içindekiler!

### Adım 2: Netlify ile Ücretsiz Yayınlama

Şimdi bu `build` klasörünü internete yükleyeceğiz.

1.  **Netlify'a Kaydolun:** Tarayıcınızdan [https://www.netlify.com/](https://www.netlify.com/) adresine gidin ve "Sign up" butonuna tıklayarak ücretsiz bir hesap oluşturun. (GitHub hesabınızla da kolayca giriş yapabilirsiniz).
2.  **Sitenizi Yükleyin:** Giriş yaptıktan sonra sizi bir kontrol paneli karşılayacak. Sayfada "Sites" (Siteler) bölümüne gidin. Orada "drag and drop your site folder here" (site klasörünüzü buraya sürükleyip bırakın) yazan bir alan göreceksiniz.
3.  **Sürükle ve Bırak:** Bilgisayarınızdaki **`build` klasörünü** bu alana sürükleyip bırakın.

### Adım 3: Linkiniz Hazır!

İşte bu kadar! Netlify, dosyalarınızı saniyeler içinde yükleyecek ve size `rastgele-bir-isim.netlify.app` şeklinde benzersiz bir link verecektir.

Artık bu linki kopyalayıp arkadaşlarınızla ve ailenizle paylaşabilirsiniz. Tebrikler, oyununuzu başarıyla yayınladınız!

---

## B. Kodu GitHub'a Yükleme (Opsiyonel)

Kodunuzu bir portfolyo olarak saklamak veya başkalarıyla paylaşmak için GitHub'a yükleyebilirsiniz.

### Gereksinimler

*   Bilgisayarınızda [Git](https://git-scm.com/downloads)'in yüklü olması gerekir.
*   Bir [GitHub](https://github.com/) hesabınızın olması gerekir.

### Adım 1: GitHub'da Yeni Bir Depo (Repository) Oluşturun

1.  GitHub hesabınıza giriş yapın.
2.  Sağ üst köşedeki `+` simgesine tıklayın ve "New repository" seçeneğini seçin.
3.  Deponuza bir isim verin (örneğin `tic-tac-toe-react`).
4.  Depoyu "Public" (Herkese Açık) olarak bırakın.
5.  **ÖNEMLİ:** "Initialize this repository with:" altındaki hiçbir kutucuğu (Add a README file, Add .gitignore) işaretlemeyin. Projemizde bu dosyalar zaten var.
6.  "Create repository" butonuna tıklayın.

### Adım 2: Projenizi GitHub'a Gönderin

GitHub, depo oluşturulduktan sonra size bir sonraki adımda çalıştırmanız gereken komutları gösterecektir. O komutları projenizin terminalinde sırayla çalıştırın:

1.  Projenizin ana klasöründe bir terminal açın.
2.  Git'i başlatın ve ilk "commit"inizi (kaydınızı) oluşturun:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Tic Tac Toe game project"
    ```
3.  Yerel projenizi GitHub'daki deponuza bağlayın.
    ```bash
    git remote add origin https://github.com/KULLANICI_ADINIZ/DEPO_ADINIZ.githttps://github.com/muyesserkocabasoglu1905-creator/tic-tac-toe.git
    git branch -M main
    ```
    **Not:** Yukarıdaki `https://github.com/...` ile başlayan URL'yi nereden bulacaksınız?
    *   **Yöntem 1 (En Kolay):** Depoyu oluşturduktan hemen sonra GitHub'ın size gösterdiği "Quick setup" sayfasında, `…or push an existing repository from the command line` başlığı altında bu komutların aynısı, sizin için doğru URL ile birlikte yazılıdır. Direkt oradan kopyalayabilirsiniz.
    *   **Yöntem 2:** Eğer o sayfayı kapattıysanız, deponuzun ana sayfasına gidin. Yeşil renkli **"<> Code"** düğmesine tıklayın. Açılan pencerede "HTTPS" sekmesinin seçili olduğundan emin olun ve oradaki linki kopyalayın. Kopyaladığınız bu link, yukarıdaki komutta kullanmanız gereken URL'dir.

4.  Son olarak, kodunuzu GitHub'a gönderin:
    ```bash
    git push -u origin main
    ```

Bu komutlar tamamlandığında, GitHub'daki depo sayfanızı yenilerseniz tüm proje dosyalarınızın oraya yüklendiğini göreceksiniz. Artık kodunuz güvende!
