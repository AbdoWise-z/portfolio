"use client";

import React, {useEffect, useRef} from 'react';
import SecretContent from "@/components/views/secret-content";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useSecretContextValues} from "@/components/providers/secret-content-context-provider";
import {Textarea} from "@/components/ui/textarea";
import axios from "axios";
import {ModalType, useModal} from "@/hooks/use-modal";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(1).max(500),
})

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ContactMe = () => {
  const modal = useModal();
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
      await axios.post("https://formspree.io/f/xrbzpznw", values,);
      //await sleep(5000);
      modal.open(ModalType.SUCCESS);
    } catch (e) {
      console.log(e);
      modal.open(ModalType.ERROR);
    }
  }
  
  const maskControl = useSecretContextValues();
  const ref = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    if (!maskControl.MaskSize) return;
    
    ref.current.onmouseenter = () => {
      maskControl.MaskSize!.set(0);
    }
    ref.current.onmouseleave = () => {
      maskControl.MaskSize!.set(60);
    }
  } , [maskControl.MaskSize]);
  
  return (
    <div className="relative flex flex-col contect-start items-center justify-start min-h-[110vh]">
      <div className="absolute h-[100%] w-[100%] bg-neutral-900 z-[-1]"/>
      <div className="flex flex-col mb-20 mt-20 w-[65%] h-fit content-start items-start justify-start">
        <h1 className={"text-white font-bold text-center pt-10 text-2xl md:text-4xl"} id={"CONTACT_ME_SECTION"}> {"Let's Talk"} </h1>
        <p className={"text-neutral-400 mb-10 "}>Fill the following form to send me a message</p>

        <Form {...form}>
          <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="gap-y-2 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={"w-[60%] max-w-[300px]"}>
                  <FormControl>
                    <Input placeholder="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className={"mt-4 w-[60%] max-w-[300px]"}>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className={"mt-4 w-[80%] max-w-[450px]"}>
                  <FormLabel className={"text-white"}>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="type your message here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SecretContent maskWidth={0} secret={
              <Button type="submit" variant={"outline"} className={"mt-16 px-12 rounded-full"}>Submit</Button>
            }>
              <Button type="submit" className={"mt-16 px-12 rounded-full"}>Submit</Button>
            </SecretContent>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactMe;