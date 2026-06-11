export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using Social Video Downloader, you accept and agree to be bound by the terms and 
            provisions of this agreement. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
          <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Permitted Use</h3>
          <p className="text-gray-700 mb-4">
            You are granted a limited, non-exclusive, non-transferable license to use our video downloading service 
            for personal, non-commercial purposes only.
          </p>
          
          <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Restrictions</h3>
          <p className="text-gray-700 mb-4">You agree NOT to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Download copyrighted content without proper authorization</li>
            <li>Use the service for any commercial purpose without permission</li>
            <li>Attempt to circumvent any security measures</li>
            <li>Use automated tools to overload or abuse the service</li>
            <li>Redistribute or resell downloaded content</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Copyright and Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            You are solely responsible for ensuring that you have the right to download and use any content. 
            We do not endorse or encourage copyright infringement. You must respect the intellectual property 
            rights of content creators.
          </p>
          <p className="text-gray-700 mb-4">
            Our service is provided as a tool only. We are not responsible for how you use downloaded content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Availability</h2>
          <p className="text-gray-700 mb-4">
            We strive to maintain high availability but do not guarantee uninterrupted access to our service. 
            We reserve the right to modify, suspend, or discontinue the service at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>You are responsible for your use of the service and any content you download</li>
            <li>You must comply with all applicable laws and platform terms of service</li>
            <li>You must not use the service in any way that could harm or overload our systems</li>
            <li>You are responsible for maintaining the security of your access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
          <p className="text-gray-700 mb-4">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
            WE DO NOT WARRANT THAT:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>The service will meet your requirements</li>
            <li>The service will be uninterrupted, timely, secure, or error-free</li>
            <li>The results obtained from the service will be accurate or reliable</li>
            <li>Any errors in the service will be corrected</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            IN NO EVENT SHALL CODEORA LABS OR ITS AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
          <p className="text-gray-700 mb-4">
            You agree to indemnify and hold harmless Codeora Labs from any claims, damages, losses, liabilities, 
            and expenses arising from your use of the service or violation of these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
          <p className="text-gray-700 mb-4">
            Our service may contain links to third-party websites. We are not responsible for the content, 
            privacy policies, or practices of these external sites.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to terminate or suspend your access to the service immediately, without prior 
            notice, for any breach of these Terms and Conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service after changes 
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These terms shall be governed by and construed in accordance with applicable laws, without regard 
            to conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms and Conditions, please contact:
          </p>
          <p className="text-gray-700 font-medium">
            Codeora Labs<br />
            Email: legal@codeoralabs.com
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>Powered by <span className="font-semibold text-gray-900">Codeora Labs</span></p>
        </footer>
      </div>
    </div>
  );
}
