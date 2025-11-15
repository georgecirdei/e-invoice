'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

interface ContactFormBlockProps {
  heading?: string;
  description?: string;
  submitText?: string;
}

export function ContactFormBlock({ heading, description, submitText }: ContactFormBlockProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await fetch('http://localhost:8000/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });
      
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {heading && (
            <h2 className="text-4xl font-bold text-center mb-4">{heading}</h2>
          )}
          {description && (
            <p className="text-center text-muted-foreground mb-8">{description}</p>
          )}
          
          {submitted ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground">We'll get back to you soon.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    name="name"
                    label="Name"
                    placeholder="Your name"
                    required
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email"
                    placeholder="your@email.com"
                    required
                  />
                  <Input
                    name="phone"
                    label="Phone"
                    placeholder="Your phone (optional)"
                  />
                  <Input
                    name="subject"
                    label="Subject"
                    placeholder="What is this about?"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      name="message"
                      className="w-full px-3 py-2 border border-input rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Sending...' : (submitText || 'Send Message')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}

