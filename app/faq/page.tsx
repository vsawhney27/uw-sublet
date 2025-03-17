import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

// FAQ data with questions and answers
const faqs = [
  {
    question: "What is BadgerSublets?",
    answer: "BadgerSublets is a platform specifically designed for UW-Madison students to find and list sublets. Our platform focuses on making it easy to find housing near campus with verified student listings."
  },
  {
    question: "Who can use BadgerSublets?",
    answer: "BadgerSublets is primarily for UW-Madison students. You need a valid UW-Madison email address to create an account and list properties. Anyone can browse listings, but only verified students can contact hosts or list properties."
  },
  {
    question: "How do I list my apartment or room?",
    answer: "To list your property: 1) Sign in with your UW-Madison email, 2) Click 'Create Listing' in the navigation menu, 3) Fill out the listing details including photos, amenities, and availability, 4) Choose to save as draft or publish immediately."
  },
  {
    question: "Is it free to use BadgerSublets?",
    answer: "Yes, BadgerSublets is completely free to use for both listing and finding sublets. We believe in making the subletting process as accessible as possible for students."
  },
  {
    question: "How do I contact a host?",
    answer: "When viewing a listing, you'll see options to either send an in-app message or email the host. You must be signed in to contact hosts. We recommend using the in-app messaging for faster responses."
  },
  {
    question: "What should I include in my listing?",
    answer: "For the best results, include: clear photos of all rooms, accurate pricing, detailed description of amenities, specific availability dates, location details, and any important house rules or preferences. More detail helps attract serious inquiries."
  },
  {
    question: "How do I report a problem?",
    answer: "If you encounter inappropriate content or suspicious activity, use the 'Report' button on the listing or contact support@badgersublets.com. We take all reports seriously and will investigate promptly."
  },
  {
    question: "Are the listings verified?",
    answer: "While we verify that listers are UW-Madison students, we recommend doing your own due diligence before signing any agreements. Always view the property in person if possible and get everything in writing."
  },
  {
    question: "Can I edit my listing after publishing?",
    answer: "Yes, you can edit your listing at any time. You can update details, change photos, adjust pricing, or mark it as no longer available. You can also save listings as drafts while you gather information."
  },
  {
    question: "How do I delete my listing?",
    answer: "To delete a listing, go to the listing page and click the 'Delete' button. You'll be asked to confirm the deletion. Note that this action cannot be undone."
  }
]

// FAQ page with accordion layout
export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Still have questions? Contact us at{" "}
            <a href="mailto:support@badgersublets.com" className="text-red-700 hover:underline">
              support@badgersublets.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 