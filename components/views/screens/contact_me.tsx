"use client";

import React, {useRef} from 'react';
import {motion, useScroll, useTransform} from "framer-motion";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {ModalType, useModal} from "@/hooks/use-modal";
import {CV_PATH, SECTIONS, SOCIAL_LINKS} from "@/lib/site";
import Magnetic from "@/components/views/magnetic";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xrbzpznw";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(50),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(1, "Please write a message.").max(500, "Keep it under 500 characters."),
})

const directLink = "text-cyan-800 underline-offset-4 transition-colors hover:text-cyan-950 hover:underline dark:text-cyan-300 dark:hover:text-cyan-100";

const ContactMe = () => {
  const modal = useModal();
  const ref = useRef<HTMLElement>(null);
  // Curtain entry: rises a little faster than the page and settles as its top reaches the viewport.
  const { scrollYProgress: entry } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const y = useTransform(entry, [0, 1], [96, 0]);
  const borderRadius = useTransform(entry, [0, 1], [48, 0]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    modal.open(ModalType.LOADING);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json", Accept: "application/json"},
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`Formspree responded with ${res.status}`);
      modal.open(ModalType.SUCCESS);
      form.reset();
    } catch (e) {
      console.error(e);
      modal.open(ModalType.ERROR);
    }
  }

  return (
    <motion.section
      ref={ref}
      id={SECTIONS.contact}
      style={{ y, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      className="section-gutter section-panel relative z-40 flex min-h-screen scroll-mt-24 flex-col border-t border-foreground/10 pb-10 pt-24 shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.45)] md:pt-32"
    >
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="eyebrow mb-6">05 · Contact</h2>
          <p className="text-3xl font-bold text-foreground md:text-5xl">{"Let's talk."}</p>
          <p className="mt-4 max-w-md text-muted-foreground">
            Have a project, a question, or just want to say hi? Send a message with the form, or reach me directly.
          </p>

          <dl className="mt-10 space-y-3 text-sm">
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-20 text-muted-foreground">Email</dt>
              <dd><a className={directLink} href={`mailto:${SOCIAL_LINKS.email}`}>{SOCIAL_LINKS.email}</a></dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-20 text-muted-foreground">LinkedIn</dt>
              <dd><a className={directLink} href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">in/xabdomo</a></dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-20 text-muted-foreground">GitHub</dt>
              <dd><a className={directLink} href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">AbdoWise-z</a></dd>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <dt className="w-20 text-muted-foreground">CV</dt>
              <dd><a className={directLink} href={CV_PATH} target="_blank" rel="noopener noreferrer">Download PDF</a></dd>
            </div>
          </dl>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here" rows={6} maxLength={500} {...field} />
                  </FormControl>
                  <div className="flex items-start justify-between gap-4">
                    <FormMessage />
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground" aria-live="polite">
                      {field.value.length} / 500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Magnetic>
                <Button type="submit" className="rounded-full px-12" disabled={form.formState.isSubmitting}>Send</Button>
              </Magnetic>
            </div>
          </form>
        </Form>
      </div>

      <footer className="mx-auto mt-20 flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 border-t border-foreground/10 pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Abdelrahman Mahmoud</span>
        <span>Built with Next.js. Click anywhere for a shooting star.</span>
      </footer>
    </motion.section>
  );
};

export default ContactMe;
