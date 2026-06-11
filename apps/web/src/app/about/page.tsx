export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Social Video Downloader</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            Social Video Downloader is a free, easy-to-use tool designed to help you save videos from popular 
            social media platforms. We believe in providing a simple, secure, and reliable service that respects 
            user privacy while delivering high-quality downloads.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <p className="text-gray-700 mb-4">
            Our platform allows you to download videos from various social media platforms quickly and efficiently. 
            Simply paste the video URL, and we&apos;ll handle the rest. No registration required, no hidden fees, 
            and no complicated processes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Fast Downloads</h3>
              <p className="text-gray-700">
                Download videos at high speed without compromising quality.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Secure & Private</h3>
              <p className="text-gray-700">
                We don&apos;t store your videos or track your download history.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Multi-Platform</h3>
              <p className="text-gray-700">
                Support for multiple social media platforms in one place.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💯 100% Free</h3>
              <p className="text-gray-700">
                No hidden costs, no subscription fees, completely free to use.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 User-Friendly</h3>
              <p className="text-gray-700">
                Simple interface that anyone can use without technical knowledge.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Regular Updates</h3>
              <p className="text-gray-700">
                We continuously improve our service to support new platforms and features.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Copy Video URL</h3>
                <p className="text-gray-700">
                  Find the video you want to download and copy its URL from your browser or app.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Paste URL</h3>
                <p className="text-gray-700">
                  Paste the URL into our downloader and click the download button.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Download</h3>
                <p className="text-gray-700">
                  Your video will be processed and ready to download in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            We are committed to providing a reliable service while respecting copyright laws and user privacy. 
            We encourage users to download content responsibly and only when they have the right to do so.
          </p>
          <p className="text-gray-700 mb-4">
            Our service is intended for personal use, allowing users to save content for offline viewing, 
            backup purposes, or when permitted by the content creator.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology</h2>
          <p className="text-gray-700 mb-4">
            Built with modern web technologies and robust backend infrastructure, our platform ensures fast 
            processing times and reliable downloads. We continuously update our systems to maintain compatibility 
            with evolving social media platforms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            Have questions, suggestions, or feedback? We&apos;d love to hear from you!
          </p>
          <p className="text-gray-700 font-medium">
            Email: support@codeoralabs.com
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Powered by <span className="font-semibold text-gray-900">Codeora Labs</span>
            </p>
            <p className="text-sm text-gray-500">
              Building innovative solutions for the digital age
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
