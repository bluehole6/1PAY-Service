# -*- coding: utf-8 -*-
import sys
from selenium import webdriver
from selenium.webdriver.support.ui import Select
import re
def rePlaceData(value) :
    numbers = re.findall("\d+", value)
    result = ""
    for i in numbers:
        decodedNumber = i.decode('utf-8');
        result += decodedNumber
    return result
def getLinaData(name, birth, gender):
    driver = webdriver.Chrome('./chromedriver')
    scrapingResult = {
        'company': "라이나",
        'price': 0,
        'contents': []
    }
    driver.implicitly_wait(3)
    driver.get('https://direct.lina.co.kr/product/ess/dtc01/easy')
    driver.implicitly_wait(3)
    textBox = driver.find_element_by_xpath('//*[@id="birthday"]')
    textBox.send_keys(birth);
    if gender == 1:
        femaleBtn = driver.find_element_by_xpath('//*[@id="main_btn_female"]')
        femaleBtn.click();
    else:
        maleBtn = driver.find_element_by_xpath('//*[@id="main_btn_male"]')
        maleBtn.click();
    resultBtn = driver.find_element_by_xpath('//*[@id="btn_direct_dental_cal"]')
    resultBtn.click();
    htmlResult = driver.find_element_by_xpath('//*[@id="mo_amount_span"]').text;
    resultValue = rePlaceData(htmlResult)
    scrapingResult['price'] = resultValue
    detailBtn = driver.find_element_by_xpath('//*[@id="openLayerplanPonA2"]')
    detailBtn.click();
    tableBody = driver.find_element_by_xpath('//*[@id="planPonA2"]/div/div[2]/div/div/table[1]').find_element_by_tag_name('tbody')
    rows = tableBody.find_elements_by_tag_name("tr")
    contentsList = []
    for index, value in enumerate(rows):
        if index != 0:
            print (value.find_elements_by_tag_name('th')[0].text)
            contentsList.append(value.find_elements_by_tag_name('th')[0].text.encode('utf-8'))
    scrapingResult['contents'] = contentsList
    print (scrapingResult)
    return scrapingResult
def getAIAData(name, birth, gender):
    driver = webdriver.Chrome('./chromedriver')
    scrapingResult = {
        'company': "AIA",
        'price': 0,
        'contents': []
    }
    driver.implicitly_wait(3)
    driver.get('https://www.aia.co.kr/ko/our-products/medical-protection/non-par-denteal-health-plan.html#')
    driver.implicitly_wait(3)
    # name.decode('utf-8').encode('euc-kr')
    textBox = driver.find_element_by_xpath('//*[@id="aia644363719"]');
    textBox.send_keys("19"+birth);
    if gender == 1:
        femaleBtn = driver.find_element_by_xpath('//*[@id="calculator-container-form"]/div[1]/div[2]/div/div[1]/div/div[3]/div[1]/div[1]')
        femaleBtn.click();
    else:
        maleBtn = driver.find_element_by_xpath('//*[@id="calculator-container-form"]/div[1]/div[2]/div/div[1]/div/div[3]/div[1]/div[2]')
        maleBtn.click();
    resultBtn = driver.find_element_by_xpath('//*[@id="btn806817556"]')
    resultBtn.click();
    driver.implicitly_wait(3)
    htmlResult = driver.find_element_by_xpath('//*[@id="premium-by-timespan-value"]').text;
    resultValue = rePlaceData(htmlResult)
    scrapingResult['price'] = resultValue
    tableBody = driver.find_element_by_xpath('//*[@id="collapse-large-724022276"]/div[1]/div/table').find_element_by_tag_name('tbody')
    driver.find_element_by_xpath('//*[@id="the_fine_print"]/div[2]/div[1]/div[2]/div/a[2]').click()
    rows = tableBody.find_elements_by_tag_name("tr")
    contentsList = []
    for index, value in enumerate(rows):
        if index != 0:
            print (value.find_elements_by_tag_name('td')[0].text)
            contentsList.append(value.find_elements_by_tag_name('td')[0].text.encode('utf-8'))
    scrapingResult['contents'] = contentsList
    return scrapingResult
driver = webdriver.Chrome('./chromedriver')

def getAxaData(name, birth, gender):
    scrapingResult = {
        'company': "AIA",
        'price': 0,
        'contents': []
    }
    driver.implicitly_wait(3)
    driver.get('https://www.axa.co.kr/ActionControler.action?screenID=SHLI0000&actionID=I16#')
    driver.implicitly_wait(3)
    textBox = driver.find_element_by_xpath('//*[@id="if_02"]');
    textBox2 = driver.find_element_by_xpath('//*[@id="frmStep01"]/div[1]/table/tbody/tr/td/input[2]');
    textBox.send_keys(birth);
    textBox2.send_keys('1');
    resultBtn = driver.find_element_by_xpath('//*[@id="frmStep01"]/div[2]/div/a')
    resultBtn.click();
    driver.implicitly_wait(3)
    price = driver.find_element_by_xpath('//*[@id="content"]/input[23]');
    print("price.text")
    print(price.get_property('value'))

getAIAData('Yun', '921112', 1)