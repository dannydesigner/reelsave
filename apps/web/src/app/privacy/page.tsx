export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Welcome to Social Video Downloader. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we handle your information when you use our video downloading service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Video URLs that you submit for downloading</li>
            <li>Usage data and interaction with our service</li>
          </ul>
          
          <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Time and date of access</li>
            <li>Pages visited and features used</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>To provide and maintain our video downloading service</li>
            <li>To process your video download requests</li>
            <li>To improve our service and user experience</li>
            <li>To detect and prevent technical issues or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your data. Video files and URLs 
            are temporarily stored only during the download process and are automatically deleted after completion.
          </p>
          <p className="text-gray-700 mb-4">
            We do not permanently store downloaded videos or maintain a database of user download history.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            Our service interacts with third-party platforms (e.g., social media sites) to retrieve video content. 
            We do not share your personal information with these platforms beyond what is necessary to process your request.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use essential cookies to ensure the proper functioning of our service. These cookies do not track 
            your personal information across other websites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our service is not directed to individuals under the age of 13. We do not knowingly collect personal 
            information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting 
            the new policy on this page with an updated date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-gray-700 font-medium">
            Codeora Labs<br />
            Email: privacy@codeoralabs.com
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>Powered by <span className="font-semibold text-gray-900">Codeora Labs</span></p>
        </footer>
      </div>
    </div>
  );
}
