import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCreateGroup } from "../../api/hooks";
import type { GroupType } from "../../api/groups";

type FormValues = {
  name: string;
  type: GroupType;
  destination: string;
  startDate: string;  // ISO yyyy-MM-dd hoặc "" khi chưa chọn
  endDate: string;
  defaultCurrency: string;
  notes: string;
};

const schema = Yup.object({
  name: Yup.string().min(2).max(60).required("Nhập tên nhóm"),
  type: Yup.mixed<GroupType>().oneOf(["GENERAL","TRIP","HOME","COUPLE"]).required(),
  startDate: Yup.string().when("type",(t,s)=> t[0]==="TRIP" ? s.required("Chọn ngày bắt đầu") : s.notRequired()),
  endDate: Yup.string().when("type",(t,s)=> t[0]==="TRIP" ? s.required("Chọn ngày kết thúc") : s.notRequired()),
});

const TYPES: GroupType[] = ["GENERAL","TRIP","HOME","COUPLE"];

function toISODate(d: Date) {
  return d.toISOString().slice(0,10);
}

export default function AddGroupScreen({ navigation }: any){
  const create = useCreateGroup();
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const initial: FormValues = {
    name:"", type:"GENERAL", destination:"", startDate:"", endDate:"",
    defaultCurrency:"VND", notes:""
  };

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) as number}
    >
      <Formik<FormValues>
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (v,{setSubmitting})=>{
          try{
            const toNull = (s:string) => (s && s.trim()!=="" ? s : null);
            const payload =
              v.type === "TRIP"
                ? {
                    name: v.name,
                    type: v.type,
                    destination: toNull(v.destination),
                    startDate: v.startDate,
                    endDate: v.endDate,
                    defaultCurrency: toNull(v.defaultCurrency),
                    notes: toNull(v.notes),
                  }
                : {
                    name: v.name,
                    type: v.type,
                    destination: toNull(v.destination),
                    startDate: null,
                    endDate: null,
                    defaultCurrency: toNull(v.defaultCurrency),
                    notes: toNull(v.notes),
                  };

            await create.mutateAsync(payload);
            Alert.alert("OK","Tạo nhóm thành công");
            navigation.goBack();
          } catch (e:any) {
            const msg = e?.response
              ? `${e.response.status} – ${e.response.data?.message ?? JSON.stringify(e.response.data)}`
              : e?.message ?? "Không tạo được nhóm";
            Alert.alert("Lỗi", msg);
          } finally { setSubmitting(false); }
        }}
      >
        {({ values, errors, handleChange, setFieldValue, handleSubmit, isSubmitting }) => (
          <ScrollView
            style={{ flex:1 }}
            contentContainerStyle={{ padding:16, paddingBottom:32 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={{ fontSize:18, fontWeight:"700" }}>Tạo nhóm</Text>

            {/* Tên nhóm */}
            <Text style={{ fontWeight:"700", marginTop:12 }}>Tên nhóm</Text>
            <TextInput
              value={values.name}
              onChangeText={handleChange("name")}
              placeholder="VD: Trip Đà Lạt"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12, marginTop:6 }}
            />
            {!!errors.name && <Text style={{ color:"red", marginTop:6 }}>{String(errors.name)}</Text>}

            {/* Loại nhóm – chip giống Settings */}
            <Text style={{ fontWeight:"700", marginTop:16 }}>Loại nhóm</Text>
            <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:8 }}>
              {TYPES.map((t)=>(
                <TouchableOpacity
                  key={t}
                  onPress={()=> setFieldValue("type", t)}
                  style={{
                    paddingVertical:8, paddingHorizontal:12, borderRadius:16,
                    borderWidth:1, borderColor: values.type===t ? "#007AFF" : "#ddd",
                    backgroundColor: values.type===t ? "#E6F0FF" : "#fff"
                  }}
                >
                  <Text style={{ color: values.type===t ? "#007AFF" : "#333" }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chỉ hiện khi là TRIP */}
            {values.type === "TRIP" && (
              <>
                <Text style={{ fontWeight:"700", marginTop:16 }}>Điểm đến</Text>
                <TextInput
                  value={values.destination}
                  onChangeText={handleChange("destination")}
                  placeholder="Đà Lạt"
                  style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12, marginTop:6 }}
                />

                <Text style={{ fontWeight:"700", marginTop:16 }}>Ngày bắt đầu (yyyy-MM-dd)</Text>
                <TouchableOpacity
                  onPress={()=> setShowStart(true)}
                  style={{
                    borderWidth:1, borderColor:"#ddd", borderRadius:8,
                    padding:12, marginTop:6, backgroundColor:"#fff"
                  }}
                >
                  <Text style={{ color: values.startDate ? "#111" : "#888" }}>
                    {values.startDate || "Chọn ngày bắt đầu"}
                  </Text>
                </TouchableOpacity>
                {!!errors.startDate && <Text style={{ color:"red", marginTop:6 }}>{String(errors.startDate)}</Text>}
                {showStart && (
                  <DateTimePicker
                    value={values.startDate ? new Date(values.startDate) : new Date()}
                    mode="date"
                    onChange={(e,d)=>{ setShowStart(false); if(d) setFieldValue("startDate", toISODate(d)); }}
                  />
                )}

                <Text style={{ fontWeight:"700", marginTop:16 }}>Ngày kết thúc (yyyy-MM-dd)</Text>
                <TouchableOpacity
                  onPress={()=> setShowEnd(true)}
                  style={{
                    borderWidth:1, borderColor:"#ddd", borderRadius:8,
                    padding:12, marginTop:6, backgroundColor:"#fff"
                  }}
                >
                  <Text style={{ color: values.endDate ? "#111" : "#888" }}>
                    {values.endDate || "Chọn ngày kết thúc"}
                  </Text>
                </TouchableOpacity>
                {!!errors.endDate && <Text style={{ color:"red", marginTop:6 }}>{String(errors.endDate)}</Text>}
                {showEnd && (
                  <DateTimePicker
                    value={values.endDate ? new Date(values.endDate) : new Date()}
                    mode="date"
                    onChange={(e,d)=>{ setShowEnd(false); if(d) setFieldValue("endDate", toISODate(d)); }}
                  />
                )}
              </>
            )}

            {/* Currency */}
            <Text style={{ fontWeight:"700", marginTop:16 }}>Tiền tệ mặc định</Text>
            <TextInput
              value={values.defaultCurrency}
              onChangeText={handleChange("defaultCurrency")}
              placeholder="VND, USD…"
              autoCapitalize="characters"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12, marginTop:6 }}
            />

            {/* Notes */}
            <Text style={{ fontWeight:"700", marginTop:16 }}>Ghi chú</Text>
            <TextInput
              multiline
              value={values.notes}
              onChangeText={handleChange("notes")}
              placeholder="Ghi chú"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12, marginTop:6, minHeight:80 }}
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={()=> handleSubmit()}
              disabled={isSubmitting || create.isPending}
              style={{
                backgroundColor: "#16a34a",
                opacity: isSubmitting || create.isPending ? 0.7 : 1,
                padding: 12, borderRadius: 8, alignItems: "center", marginTop: 20
              }}
            >
              <Text style={{ color:"#fff", fontWeight:"700" }}>
                {isSubmitting || create.isPending ? "Đang tạo..." : "Tạo nhóm"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}
