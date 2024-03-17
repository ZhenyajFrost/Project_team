import React, { useState, useEffect } from "react";
import css from "./HowItWorks.module.css"
import Carousel from "../../components/Carousel/Carousel";
import hiv from '../../Data/hiv.json'
import questions from '../../Data/questions.json'
import HIWItem from "../../components/HIWItem/HIWItem";
import video from '../../video/hiwVideo.mp4'

import data from '../../Data/cities.json'

import { styled } from '@mui/system';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactPlayer from "react-player";

const CustomAccordion = styled(Accordion)({
    '&&': {
        //borderRadius: '24px',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        overflow: 'hidden', // Ensure border radius is visible
        paddingBottom: '10px',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&.Mui-expanded': {
        },
    },
});

const CustomAccordionSummary = styled(AccordionSummary)({
    position: 'relative',
    fontWeight: '600',
    lineHeight: '24px',
    borderBottom: "1px solid var(--borderColor)",
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '24px',
    letterSpacing: '0em',
    '.MuiAccordionSummary-expandIconWrapper.Mui-expanded': {},
    '&.Mui-expanded': {
        minHeight: 48,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        left: '2.5%',
        bottom: 0,
        width: '95%',
        borderBottom: '2px solid var(--gray)',
    }
});

const CustomAccordionDetails = styled(AccordionDetails)({
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
    letterSpacing: '0em',

});

export const HowItWorks = () => {
    const items = hiv.map(item => {
        return <HIWItem item={item} />
    })


    useEffect(() => {
        window.scrollTo(0, 0);

    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5vw" }}>
            <video className={css.img} controls autoPlay auto preload="auto">
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Carousel items={items} title="Як це працює?" />

            <div>
                {questions.map(ques => {
                    return (
                        <CustomAccordion id="question">
                            <CustomAccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="question-content"
                                id="question-header"
                            >
                                {ques.title}
                            </CustomAccordionSummary>
                            <CustomAccordionDetails>
                                <div className={css.container}>
                                    {ques.text}
                                </div>
                            </CustomAccordionDetails>
                        </CustomAccordion>
                    )
                })}
            </div>

        </div>
    );
};
