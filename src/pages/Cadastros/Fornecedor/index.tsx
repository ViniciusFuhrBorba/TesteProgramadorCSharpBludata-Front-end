import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCreditCard,
  FiPhone,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import Button from '../../../components/Button';
import { Container, Content, Select } from './stytes';

import getValidationErrors from '../../../utils/getValidationErros';
import Input from '../../../components/Input';
import api from '../../../services/api';

interface FornecedorFormData {
  empresa: number;
  nome_fornecedor: string;
  cpf_cnpj: string;
  data_hora_cadastro: string;
  telefone: string;
  tipo_pessoa: string;
  rg?: string;
  data_nascimento?: string;
}

interface Empresa {
  id: number;
  nome_fantasia: string;
  uf: string;
}

const CadastroFornecedor: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [valueSelectPessoa, selValueSelectPessoa] = useState('');
  const [valueSelectEmpresa, selValueSelectEmpresa] = useState(0);
  const [selectErrorPessoa, setSelectErrorPessoa] = useState(false);
  const [selectErrorEmpresa, setSelectErrorEmpresa] = useState(false);
  const [errorIdade, setErrorIdade] = useState(false);

  // console.log(valueSelectPessoa);
  // console.log(valueSelectEmpresa);

  useEffect(() => {
    api.get('/empresas').then(response => {
      const allEmpresas = response.data;
      setEmpresas(allEmpresas);
    });
  }, []);

  const optionItems = empresas.map(item => {
    return (
      <option key={item.id} value={item.id}>
        {item.nome_fantasia}
      </option>
    );
  });

  // console.log(optionItems);

  const saveEmpresa = useCallback(
    async (data: FornecedorFormData) => {
      if (valueSelectPessoa !== 'Tipo Pessoa' && valueSelectEmpresa !== 0) {
        setSelectErrorPessoa(false);
        setSelectErrorEmpresa(false);
        try {
          formRef.current?.setErrors({});
          const schema = Yup.object().shape({
            nome_fornecedor: Yup.string().required(
              'O Nome do Fornecedor ?? obrigat??rio',
            ),
            cpf_cnpj: Yup.string()
              .required('CPF ou CNPJ obrigat??rio')
              .min(9, 'O m??nimo de digitos ?? de 9(CPF)')
              .max(14, 'O m??ximo de digitos ?? de 14(CNPJ)'),
            telefone: Yup.string()
              .required('O Telefone/Celular ?? obrigat??rio')
              .min(12, 'Deve conter no m??nimo 12 caract??res contando com (ddd)')
              .max(
                13,
                'Deve conter no m??nimo 13 caract??res contando com (ddd)',
              ),
            rg: Yup.string(),
            data_nascimento: Yup.string(),
            // .min(10, 'Deve conter no m??nimo 10 caract??res')
            // .max(10, 'Deve conter no m??ximo 10 caract??res'),
          });

          await schema.validate(data, {
            abortEarly: false,
          });

          const {
            nome_fornecedor,
            cpf_cnpj,
            telefone,
            rg,
            data_nascimento,
          } = data;

          const now = new Date();
          let { data_hora_cadastro } = data;

          data_hora_cadastro = `${now.getDate()}/0${
            now.getMonth() + 1
          }/${now.getFullYear()} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

          let { empresa } = data;
          empresa = valueSelectEmpresa;
          let { tipo_pessoa } = data;
          tipo_pessoa = valueSelectPessoa;

          const formData = {
            empresa,
            nome_fornecedor,
            cpf_cnpj,
            data_hora_cadastro,
            telefone,
            tipo_pessoa,
            ...(rg && data_nascimento
              ? {
                  rg,
                  data_nascimento,
                }
              : {}),
          };

          const partesDate = data_nascimento?.split('/');
          if (partesDate) {
            const year = partesDate[2];
            let uf;
            const diferenca = now.getFullYear() - Number(year);
            console.log(diferenca);

            empresas.filter(resp => {
              if (resp.id === valueSelectEmpresa) {
                uf = resp.uf;
              }
              return null;
            });
            if (diferenca < 18 && uf === 'PR') {
              setErrorIdade(true);
            }
            if (diferenca < 18 && uf !== 'PR') {
              setErrorIdade(false);
            }
          }

          if (errorIdade !== false) {
            console.log('entrei1');
            console.log(formData);
          }
          if (errorIdade !== true) {
            console.log('entrei2');
            console.log(formData);
          }
          // const response = await api.post('/fornecedores', formData);
        } catch (err) {
          if (err instanceof Yup.ValidationError) {
            const errors = getValidationErrors(err);
            formRef.current?.setErrors(errors);
          }
        }
      } else if (
        valueSelectPessoa !== 'Tipo Pessoa' &&
        valueSelectEmpresa === 0
      ) {
        setSelectErrorEmpresa(true);
        setSelectErrorPessoa(false);
      } else if (
        valueSelectPessoa === 'Tipo Pessoa' &&
        valueSelectEmpresa !== 0
      ) {
        setSelectErrorPessoa(true);
        setSelectErrorEmpresa(false);
      } else {
        setSelectErrorPessoa(true);
        setSelectErrorEmpresa(true);
      }
    },
    [valueSelectPessoa, valueSelectEmpresa, empresas, errorIdade],
  );

  return (
    <Container>
      <header>
        <div>
          <Link to="/">
            <FiArrowLeft />
          </Link>
        </div>
      </header>
      <Content>
        <Form ref={formRef} onSubmit={saveEmpresa}>
          <h1>Cadastro Fornecedor</h1>
          <Select onChange={e => selValueSelectEmpresa(Number(e.target.value))}>
            <>
              <option value={0} key={0}>
                Empresas
              </option>
              {optionItems}
            </>
          </Select>
          {selectErrorEmpresa && <p>Selecione uma das op????es acima</p>}
          <Input
            name="nome_fornecedor"
            placeholder="Nome do Fornecedor"
            icon={FiUser}
          />
          <Input name="cpf_cnpj" placeholder="CPF/CNPJ" icon={FiUser} />
          <Input
            name="telefone"
            placeholder="Telefone/Celular"
            icon={FiPhone}
          />
          <Select onChange={e => selValueSelectPessoa(e.target.value)}>
            <option value="Tipo Pessoa" key="tipoPessoa">
              Tipo de Pessoa
            </option>
            <option value="Juridica" key="pessoaJuridica">
              Juridica
            </option>
            <option value="F??sica" key="pessoaFisica">
              Fisica
            </option>
          </Select>
          {selectErrorPessoa && <p>Selecione uma das op????es acima</p>}
          {valueSelectPessoa === 'F??sica' ? (
            <>
              <Input name="rg" placeholder="RG" icon={FiCreditCard} />
              <Input
                name="data_nascimento"
                placeholder="Data de Nascimento"
                icon={FiCalendar}
              />
              {errorIdade && (
                <>
                  <p>O fornecedor precisa ter mais ou 18 anos</p>
                  <p> para poder fazer refer??ncia a uma empresa do Paran??</p>
                </>
              )}
            </>
          ) : null}
          <Button type="submit">Salvar Fornecedor</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default CadastroFornecedor;
