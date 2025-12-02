import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I join a pool?',
    answer: 'Simply browse available pools, check the details like departure time and destination, and click "Join Pool". Make sure you complete your profile onboarding first!'
  },
  {
    question: 'Can I create my own pool?',
    answer: 'Yes! Click on "Create Pool" from the Pools page, fill in your journey details including start point, destination, timing, and transport mode. Your pool will be visible to all Thapargo users immediately.'
  },
  {
    question: 'What are female-only pools?',
    answer: 'Female-only pools are exclusive carpools where only female students can join. Creators can mark their pool as female-only when creating it to ensure a comfortable travel environment.'
  },
  {
    question: 'How is the fare calculated?',
    answer: 'The pool creator sets the fare per person based on the journey distance and transport mode. This typically includes fuel costs and toll charges divided equally among all passengers.'
  },
  {
    question: 'Can I leave a pool after joining?',
    answer: 'Yes, you can leave a pool anytime before the departure time. However, please be considerate and inform the creator if possible. Pool creators cannot leave their own pools.'
  },
  {
    question: 'Is Thapargo only for Thapar students?',
    answer: 'Currently, yes. Thapargo is designed specifically for the Thapar University community to ensure safety and trust among users.'
  },
  {
    question: 'What transport modes are supported?',
    answer: 'We support multiple transport modes including car, bike, train, bus, plane, and ferry. Choose the one that matches your journey when creating a pool.'
  },
  {
    question: 'How do I verify other users?',
    answer: 'All users sign up with their Thapar email addresses. You can see member profiles in each pool showing their name and gender for additional transparency.'
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Thapargo
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card hover:bg-accent/5 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
