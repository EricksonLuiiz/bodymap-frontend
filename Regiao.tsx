'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../components/ui/carousel';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '../../components/ui/button';
import InfoItem from './InfoItem';
import Loading from './loading';
import { Separator } from '@/components/ui/separator';

interface Regiao {
  id: number | string;
  regiao: string;
}

interface ItemRegiao {
  id: number;
  nome: string;
  regiao: string;
  imagem: string;
}

interface DadosMusculo {
  id: number;
  nome: string;
  origem: string;
  insercao: string;
  inervacao: string;
  acao: string;
  plano_movimento: string;
  regiao: string;
  imagem: string;
}

const API_BASE_URL = 'https://bodymap-back.vercel.app';

function firstLetterToUpperCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Regiao() {
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [itensRegiao, setItensRegiao] = useState<{
    [key: string]: ItemRegiao[];
  }>({});
  const [dadosMusculo, setDadosMusculo] = useState<DadosMusculo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMuscle, setIsLoadingMuscle] = useState(false);

  useEffect(() => {
    buscarRegioes();
  }, []);

  const buscarDadosMusculo = async (id: number) => {
    setIsLoadingMuscle(true);
    try {
      const resposta = await fetch(`${API_BASE_URL}/item-selecionado/${id}`);
      const dados = await resposta.json();
      setDadosMusculo(Array.isArray(dados.rows[0]) ? dados.rows[0] : [dados.rows[0]]);
      setIsOpen(true);
    } catch (erro) {
      console.error('Erro ao buscar dados do músculo:', erro);
      setDadosMusculo([]);
    } finally {
      setIsLoadingMuscle(false);
    }
  };

  const buscarRegioes = async () => {
    try {
      const resposta = await fetch(`${API_BASE_URL}/regiao`);
      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
      }
      const dados = await resposta.json();
      setRegioes(dados.rows);

      const itensPromises = dados.rows.map(async (regiao: Regiao) => {
        const respostaItens = await fetch(`${API_BASE_URL}/item-regiao/${regiao.regiao}`);
        const dadosItens = await respostaItens.json();
        return { regiao: regiao.regiao, itens: dadosItens };
      });

      const resultados = await Promise.all(itensPromises);
      const itensMap: { [key: string]: ItemRegiao[] } = resultados.reduce(
        (acc, { regiao, itens }) => {
          acc[regiao] = itens.rows;
          return acc;
        },
        {} as { [key: string]: ItemRegiao[] },
      );

      setItensRegiao(itensMap);
    } catch (erro) {
      console.error('Erro ao buscar regiões:', erro);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const musculoSelecionado = dadosMusculo[0];

  return (
    <>
      {/* Loader */}
      {isLoadingMuscle && <Loading />}

      <div className="w-full max-w-[90%] md:max-w-lg mt-3 mx-auto text-center bg-[hsl(var(--card))] shadow-lg rounded-lg py-10 px-5">
        <div>
          <Image
            priority
            src="logoBodyMap.svg"
            alt="Logo"
            className="w-3/5 mx-auto mb-4 [filter:brightness(100%)_invert(10%)_opacity(100%)] [mix-blend-mode:hard-light] [drop-shadow:5px,5px,5px_rgba(0,0,0,0.8)]!important"
            width={100}
            height={100}
          />
        </div>

        <div className="text-[hsl(var(--font-color))!important]">
          <h4>Um mapa dos músculos.</h4>
          <h4 className="mb-[16px]">Origem, inserção e ação.</h4>
          <Separator />
        </div>

        {regioes.map((regiao) => (
          <Accordion key={regiao.regiao} type="single" collapsible>
            <AccordionItem value={`item-${regiao.regiao}`}>
              <AccordionTrigger>{regiao.regiao.toUpperCase()}</AccordionTrigger>
              <AccordionContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {itensRegiao[regiao.regiao]?.map((item) => (
                      <CarouselItem
                        key={item.id}
                        className="basis-2/2 bg-[hsl(var(--card))] cursor-pointer"
                        onClick={() => buscarDadosMusculo(item.id)}
                      >
                        <div className="flex flex-col items-center p-4 justify-center">
                          <div className="h-[100px] flex items-center justify-center">
                            <Image
                              src={`data:image/jpeg;base64,${item.imagem}`}
                              alt={item.nome}
                              className="rounded-lg w-auto h-[100px]"
                              width={100}
                              height={100}
                              placeholder="blur"
                              blurDataURL={`data:image/jpeg;base64,${item.imagem}`}
                            />
                          </div>
                          <span className="mt-2 text-center text-psm font-semibold">
                            {item.nome.toUpperCase()}
                          </span>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-full bg-[hsl(var(--card))] border-none">
          <div className="mx-auto w-auto h-full flex flex-col justify-between">
            <DrawerHeader>
              <DrawerTitle>
                {musculoSelecionado?.nome.toUpperCase() || 'Detalhes do Músculo'}
              </DrawerTitle>
              <DrawerDescription className="text-sm">
                Informações detalhadas do músculo selecionado
              </DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="p-4 max-h-[80vh] overflow-auto rounded-md scrollbar-custom">
              {musculoSelecionado && (
                <div className="p-4">
                  <div className="flex flex-col items-center space-y-4 overflow-auto">
                    <Image
                      src={`data:image/jpeg;base64,${musculoSelecionado.imagem}`}
                      alt={musculoSelecionado.nome}
                      width={200}
                      height={200}
                      placeholder="blur"
                      blurDataURL={`data:image/jpeg;base64,${musculoSelecionado.imagem}`}
                      className="rounded-lg"
                    />

                    <div className="space-y-2 w-full h-full">
                      <InfoItem
                        nome="Origem"
                        valor={firstLetterToUpperCase(musculoSelecionado.origem)}
                      />

                      <InfoItem
                        nome="Inserção"
                        valor={firstLetterToUpperCase(musculoSelecionado.insercao)}
                      />

                      <InfoItem
                        nome="Inervação"
                        valor={firstLetterToUpperCase(musculoSelecionado.inervacao)}
                      />

                      <InfoItem
                        nome="Ação"
                        valor={firstLetterToUpperCase(musculoSelecionado.acao)}
                      />

                      {musculoSelecionado.plano_movimento ? (
                        <>
                          <InfoItem
                            nome="Plano de Movimento"
                            valor={firstLetterToUpperCase(musculoSelecionado.plano_movimento)}
                          />
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="mb-5 w-40 mx-auto bg-[hsl(var(--background))] hover:bg-none hover:text-black hover:border-black"
                >
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
